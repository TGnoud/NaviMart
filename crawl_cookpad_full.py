import time
import json
import re
from urllib.parse import quote, urljoin

import requests
import pandas as pd
from bs4 import BeautifulSoup
from tqdm import tqdm


BASE_URL = "https://cookpad.com"
SEARCH_KEYWORD = "món ngon mỗi ngày"
MAX_PAGES = 5
SLEEP_SECONDS = 2

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
}


def clean_text(text: str) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", " ", str(text)).strip()


def get_soup(url: str) -> BeautifulSoup:
    response = requests.get(url, headers=HEADERS, timeout=20)
    response.raise_for_status()
    return BeautifulSoup(response.text, "lxml")


def crawl_search_links(keyword: str, max_pages: int = 2):
    recipe_links = []

    for page in range(1, max_pages + 1):
        search_url = f"{BASE_URL}/vn/tim-kiem/{quote(keyword)}?page={page}"
        print(f"Đang crawl trang tìm kiếm: {search_url}")

        soup = get_soup(search_url)

        links = soup.select('a[href^="/vn/cong-thuc/"]')

        for a in links:
            href = a.get("href")
            title = clean_text(a.get_text(" ", strip=True))

            if not href or not title:
                continue

            url = urljoin(BASE_URL, href.split("?")[0])

            if url not in recipe_links:
                recipe_links.append(url)

        time.sleep(SLEEP_SECONDS)

    return recipe_links


# =========================
# JSON-LD PARSER
# =========================

def load_json_ld_objects(soup: BeautifulSoup):
    """
    Cookpad thường nhúng dữ liệu Recipe trong:
    <script type="application/ld+json">...</script>

    Trong đó hay có:
    - name
    - image
    - description
    - recipeIngredient
    - recipeInstructions

    Đây là cách lấy nguyên liệu/hướng dẫn ổn định hơn selector HTML.
    """
    objects = []

    scripts = soup.find_all("script", attrs={"type": "application/ld+json"})

    for script in scripts:
        raw = script.string or script.get_text()
        raw = raw.strip() if raw else ""

        if not raw:
            continue

        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue

        if isinstance(data, list):
            objects.extend(data)
        elif isinstance(data, dict):
            objects.append(data)

    return objects


def flatten_json_ld(data):
    """
    Trải phẳng JSON-LD vì nhiều trang dùng @graph hoặc list lồng nhau.
    """
    result = []

    if isinstance(data, dict):
        result.append(data)

        if "@graph" in data:
            result.extend(flatten_json_ld(data["@graph"]))

        for value in data.values():
            if isinstance(value, (dict, list)):
                result.extend(flatten_json_ld(value))

    elif isinstance(data, list):
        for item in data:
            result.extend(flatten_json_ld(item))

    return result


def get_recipe_json_ld(soup: BeautifulSoup):
    """
    Tìm object có @type là Recipe.
    """
    objects = load_json_ld_objects(soup)
    all_objects = []

    for obj in objects:
        all_objects.extend(flatten_json_ld(obj))

    for obj in all_objects:
        obj_type = obj.get("@type")

        if isinstance(obj_type, list):
            types = [str(t).lower() for t in obj_type]
            if "recipe" in types:
                return obj

        elif isinstance(obj_type, str):
            if obj_type.lower() == "recipe":
                return obj

    return None


def parse_instruction_item(item):
    """
    recipeInstructions có thể là:
    - list string
    - list dict HowToStep: {"text": "..."}
    - list dict HowToSection: {"itemListElement": [...]}
    """
    steps = []

    if isinstance(item, str):
        text = clean_text(item)
        if text:
            steps.append(text)

    elif isinstance(item, dict):
        # HowToStep thường có text
        if item.get("text"):
            text = clean_text(item.get("text"))
            if text:
                steps.append(text)

        # Có trang dùng name thay text
        elif item.get("name"):
            text = clean_text(item.get("name"))
            if text:
                steps.append(text)

        # HowToSection có itemListElement
        if item.get("itemListElement"):
            sub_items = item.get("itemListElement")

            if isinstance(sub_items, list):
                for sub in sub_items:
                    steps.extend(parse_instruction_item(sub))
            else:
                steps.extend(parse_instruction_item(sub_items))

    elif isinstance(item, list):
        for sub in item:
            steps.extend(parse_instruction_item(sub))

    return steps


def extract_from_json_ld(soup: BeautifulSoup):
    recipe = get_recipe_json_ld(soup)

    if not recipe:
        return {
            "title": "",
            "image_url": "",
            "intro": "",
            "ingredients": [],
            "steps": [],
        }

    title = clean_text(recipe.get("name", ""))

    image_url = ""
    image = recipe.get("image")

    if isinstance(image, str):
        image_url = image
    elif isinstance(image, list) and image:
        first_image = image[0]
        if isinstance(first_image, str):
            image_url = first_image
        elif isinstance(first_image, dict):
            image_url = first_image.get("url") or first_image.get("contentUrl") or ""
    elif isinstance(image, dict):
        image_url = image.get("url") or image.get("contentUrl") or ""

    intro = clean_text(recipe.get("description", ""))

    ingredients = []
    raw_ingredients = recipe.get("recipeIngredient") or recipe.get("ingredients") or []

    if isinstance(raw_ingredients, str):
        ingredients = [clean_text(raw_ingredients)]
    elif isinstance(raw_ingredients, list):
        ingredients = [clean_text(x) for x in raw_ingredients if clean_text(x)]

    steps = []
    raw_steps = recipe.get("recipeInstructions") or []

    if isinstance(raw_steps, (list, dict, str)):
        steps = parse_instruction_item(raw_steps)

    return {
        "title": title,
        "image_url": image_url,
        "intro": intro,
        "ingredients": list(dict.fromkeys(ingredients)),
        "steps": list(dict.fromkeys(steps)),
    }


# =========================
# FALLBACK HTML/TEXT PARSER
# =========================

def extract_meta_image(soup: BeautifulSoup):
    og_image = soup.select_one('meta[property="og:image"]')
    if og_image and og_image.get("content"):
        return og_image["content"]

    twitter_image = soup.select_one('meta[name="twitter:image"]')
    if twitter_image and twitter_image.get("content"):
        return twitter_image["content"]

    imgs = soup.find_all("img")
    for img in imgs:
        src = img.get("src") or img.get("data-src")
        if src and ("cookpad" in src or src.startswith("https://")):
            return src

    return ""


def extract_intro(soup: BeautifulSoup):
    meta_desc = soup.select_one('meta[name="description"]')
    if meta_desc and meta_desc.get("content"):
        return clean_text(meta_desc["content"])

    og_desc = soup.select_one('meta[property="og:description"]')
    if og_desc and og_desc.get("content"):
        return clean_text(og_desc["content"])

    for p in soup.find_all("p"):
        text = clean_text(p.get_text(" ", strip=True))
        if len(text) > 30:
            return text

    return ""


def extract_title(soup: BeautifulSoup):
    h1 = soup.find("h1")
    if h1:
        return clean_text(h1.get_text(" ", strip=True))

    og_title = soup.select_one('meta[property="og:title"]')
    if og_title and og_title.get("content"):
        return clean_text(og_title["content"])

    title = soup.find("title")
    if title:
        return clean_text(title.get_text(" ", strip=True))

    return ""


def get_full_page_lines(soup: BeautifulSoup):
    text = soup.get_text("\n", strip=True)
    lines = [clean_text(line) for line in text.split("\n") if clean_text(line)]
    return lines


def find_section_by_lines(lines, start_keywords, end_keywords):
    start_index = -1

    for i, line in enumerate(lines):
        lower = line.lower()
        if any(keyword.lower() in lower for keyword in start_keywords):
            start_index = i + 1
            break

    if start_index == -1:
        return []

    end_index = len(lines)

    for i in range(start_index, len(lines)):
        lower = lines[i].lower()
        if any(keyword.lower() in lower for keyword in end_keywords):
            end_index = i
            break

    return lines[start_index:end_index]


def filter_ingredient_lines(lines):
    blacklist_contains = [
        "khẩu phần", "phần ăn", "người", "phút", "giờ",
        "cookpad", "đã lưu", "lưu món", "chia sẻ", "bình luận",
        "tác giả", "xem thêm", "hướng dẫn", "cách làm",
        "đăng nhập", "đăng ký", "tải app", "ứng dụng",
        "quảng cáo", "món này", "công thức",
    ]

    ingredients = []

    for line in lines:
        line = clean_text(line)
        lower = line.lower()

        if not line:
            continue

        if len(line) < 2:
            continue

        if any(word in lower for word in blacklist_contains):
            continue

        if re.fullmatch(r"\d+\.?", line):
            continue

        if len(line) > 160:
            continue

        ingredients.append(line)

    return list(dict.fromkeys(ingredients))


def extract_ingredients_by_text_section(soup: BeautifulSoup):
    lines = get_full_page_lines(soup)

    section_lines = find_section_by_lines(
        lines=lines,
        start_keywords=["Nguyên Liệu", "Nguyên liệu", "Ingredients"],
        end_keywords=[
            "Hướng dẫn", "Hướng dẫn cách làm", "Cách làm",
            "Directions", "Steps", "Bí quyết", "Mẹo",
        ],
    )

    return filter_ingredient_lines(section_lines)


def extract_ingredients_by_li(soup: BeautifulSoup):
    candidates = []

    unit_keywords = [
        "gram", "gr", "g", "kg", "ml", "lít", "l",
        "muỗng", "thìa", "chén", "bát", "tô", "ly",
        "quả", "trái", "củ", "nhánh", "lá", "miếng", "lát",
        "ít", "vừa đủ", "tép", "con", "cọng", "bó",
    ]

    for li in soup.find_all("li"):
        text = clean_text(li.get_text(" ", strip=True))
        lower = text.lower()

        if not text or len(text) < 2 or len(text) > 160:
            continue

        has_number = bool(re.search(r"\d", text))
        has_unit = any(unit in lower for unit in unit_keywords)

        if has_number or has_unit:
            candidates.append(text)

    return filter_ingredient_lines(candidates)


def extract_ingredients_fallback(soup: BeautifulSoup):
    ingredients = extract_ingredients_by_text_section(soup)

    if not ingredients:
        ingredients = extract_ingredients_by_li(soup)

    return list(dict.fromkeys(ingredients))


def filter_step_lines(lines):
    blacklist_contains = [
        "nguyên liệu", "cookpad", "đã lưu", "lưu món",
        "chia sẻ", "bình luận", "đăng nhập", "đăng ký",
        "tải app", "ứng dụng", "quảng cáo",
    ]

    steps = []

    for line in lines:
        line = clean_text(line)
        lower = line.lower()

        if not line:
            continue

        if any(word in lower for word in blacklist_contains):
            continue

        if re.fullmatch(r"\d+\.?", line):
            continue

        if re.search(r"^\d+\s*(phút|giờ)$", lower):
            continue

        if len(line) >= 10:
            steps.append(line)

    return list(dict.fromkeys(steps))


def extract_steps_by_text_section(soup: BeautifulSoup):
    lines = get_full_page_lines(soup)

    section_lines = find_section_by_lines(
        lines=lines,
        start_keywords=[
            "Hướng dẫn cách làm", "Hướng dẫn", "Cách làm",
            "Directions", "Steps",
        ],
        end_keywords=[
            "Bí quyết", "Mẹo", "Lưu ý", "Ghi chú", "Bình luận",
            "Viết bởi", "Tác giả", "Bạn đã làm món này",
            "Công thức liên quan",
        ],
    )

    return filter_step_lines(section_lines)


def extract_steps_by_ordered_items(soup: BeautifulSoup):
    candidates = []

    for ol in soup.find_all("ol"):
        for li in ol.find_all("li"):
            text = clean_text(li.get_text(" ", strip=True))
            if len(text) >= 10:
                candidates.append(text)

    return filter_step_lines(candidates)


def extract_steps_fallback(soup: BeautifulSoup):
    steps = extract_steps_by_text_section(soup)

    if not steps:
        steps = extract_steps_by_ordered_items(soup)

    return list(dict.fromkeys(steps))


def extract_tips(soup: BeautifulSoup):
    lines = get_full_page_lines(soup)

    section_lines = find_section_by_lines(
        lines=lines,
        start_keywords=[
            "Bí quyết", "Mẹo", "Lưu ý", "Ghi chú", "Kinh nghiệm",
        ],
        end_keywords=[
            "Bình luận", "Viết bởi", "Tác giả", "Bạn đã làm món này",
            "Công thức liên quan", "Cookpad",
        ],
    )

    tips = []

    for line in section_lines:
        line = clean_text(line)
        if len(line) >= 10:
            tips.append(line)

    return list(dict.fromkeys(tips))


def debug_json_ld(url: str):
    """
    Dùng để kiểm tra trang có JSON-LD Recipe không.
    """
    soup = get_soup(url)
    objects = load_json_ld_objects(soup)

    print(f"Tìm thấy {len(objects)} script JSON-LD")

    recipe = get_recipe_json_ld(soup)

    if not recipe:
        print("Không tìm thấy @type Recipe")
        return

    print("Các key trong Recipe:")
    print(recipe.keys())

    print("\nrecipeIngredient:")
    print(json.dumps(recipe.get("recipeIngredient", []), ensure_ascii=False, indent=2))

    print("\nrecipeInstructions:")
    print(json.dumps(recipe.get("recipeInstructions", []), ensure_ascii=False, indent=2))


def debug_recipe_page(url: str):
    """
    Debug text quanh các từ khóa chính.
    """
    soup = get_soup(url)
    text = soup.get_text("\n", strip=True)
    lower = text.lower()

    for keyword in ["nguyên liệu", "hướng dẫn", "cách làm"]:
        index = lower.find(keyword)
        print("\n==============================")
        print(f"DEBUG keyword: {keyword}")

        if index == -1:
            print(f"Không tìm thấy chữ '{keyword}'")
        else:
            print(text[index:index + 3000])


def crawl_recipe_detail(url: str):
    soup = get_soup(url)

    # Ưu tiên lấy từ JSON-LD Recipe
    json_ld_data = extract_from_json_ld(soup)

    title = json_ld_data["title"] or extract_title(soup)
    image_url = json_ld_data["image_url"] or extract_meta_image(soup)
    intro = json_ld_data["intro"] or extract_intro(soup)

    ingredients = json_ld_data["ingredients"]
    if not ingredients:
        ingredients = extract_ingredients_fallback(soup)

    steps = json_ld_data["steps"]
    if not steps:
        steps = extract_steps_fallback(soup)

    tips = extract_tips(soup)

    return {
        "title": title,
        "url": url,
        "image_url": image_url,
        "intro": intro,
        "ingredients": ingredients,
        "steps": steps,
        "tips": tips,
    }


def save_json(data, filename):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def save_csv(data, filename):
    csv_data = []

    for item in data:
        csv_data.append({
            "title": item.get("title", ""),
            "url": item.get("url", ""),
            "image_url": item.get("image_url", ""),
            "intro": item.get("intro", ""),
            "ingredients": "\n".join(item.get("ingredients", [])),
            "steps": "\n".join(item.get("steps", [])),
            "tips": "\n".join(item.get("tips", [])),
        })

    df = pd.DataFrame(csv_data)
    df.to_csv(filename, index=False, encoding="utf-8-sig")


def main():
    recipe_links = crawl_search_links(
        keyword=SEARCH_KEYWORD,
        max_pages=MAX_PAGES,
    )

    print(f"Tìm thấy {len(recipe_links)} link công thức.")

    data = []

    for url in tqdm(recipe_links):
        try:
            item = crawl_recipe_detail(url)
            data.append(item)

            print("\n------------------------------")
            print("Tên món:", item["title"])
            print("URL:", item["url"])
            print("Số nguyên liệu:", len(item["ingredients"]))
            print("Số bước làm:", len(item["steps"]))

            if not item["ingredients"]:
                print("WARNING: Không lấy được nguyên liệu")

            if not item["steps"]:
                print("WARNING: Không lấy được hướng dẫn")

            time.sleep(SLEEP_SECONDS)

        except Exception as e:
            print(f"Lỗi khi crawl {url}: {e}")

    save_json(data, "cookpad_recipes_full.json")

    print("\nĐã lưu:")
    print("- cookpad_recipes_full.json")


if __name__ == "__main__":
    main()

    # Nếu vẫn không lấy được steps/nguyên liệu, hãy tạm comment main() ở trên
    # rồi bỏ comment 1 trong 2 đoạn dưới để debug:

    # test_url = "https://cookpad.com/vn/cong-thuc/10731080"
    # debug_json_ld(test_url)

    # test_url = "https://cookpad.com/vn/cong-thuc/10731080"
    # debug_recipe_page(test_url)
