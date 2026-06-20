import {
  ShoppingList,
  ShoppingListDocument,
} from './schemas/shopping-list.schema';

/**
 * Canonical API shape for a shopping list. Kept in one place so the
 * REST responses, realtime socket payloads, and generated-list wrapper
 * can never drift apart.
 */
export function toShoppingListResponse(
  list: ShoppingListDocument | ShoppingList,
) {
  return {
    id: list._id.toString(),
    familyId: list.familyId.toString(),
    name: list.name,
    type: list.type,
    status: list.status,
    plannedFor: list.plannedFor,
    completedAt: list.completedAt,
    recurrenceGroupId: list.recurrenceGroupId,
    createdBy: list.createdBy.toString(),
    progress: {
      bought: list.items.filter((item) => item.status === 'bought').length,
      total: list.items.length,
    },
    items: list.items.map((item) => ({
      id: item._id.toString(),
      foodId: item.foodId?.toString(),
      categoryId: item.categoryId?.toString(),
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      checked: item.checked,
      status: item.status,
      note: item.note,
      boughtAt: item.boughtAt,
    })),
  };
}
