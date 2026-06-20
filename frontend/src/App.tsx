import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RealtimeNotifications from './components/RealtimeNotifications';
import { PageSkeleton } from './components/Skeleton';

// Lazy routes: each page becomes its own chunk, so heavy deps
// (zxing in Scanner, admin tables...) don't bloat the initial bundle.
const Splash = lazy(() => import('./pages/Splash'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Home = lazy(() => import('./pages/Home'));
const MyLists = lazy(() => import('./pages/MyLists'));
const ListDetail = lazy(() => import('./pages/ListDetail'));
const RecipeDetail = lazy(() => import('./pages/RecipeDetail'));
const PantryDashboard = lazy(() => import('./pages/PantryDashboard'));
const AddItem = lazy(() => import('./pages/AddItem'));
const EditItem = lazy(() => import('./pages/EditItem'));
const RecipeSuggestion = lazy(() => import('./pages/RecipeSuggestion'));
const RecipeEditor = lazy(() => import('./pages/RecipeEditor'));
const MealPlanner = lazy(() => import('./pages/MealPlanner'));
const FamilySharing = lazy(() => import('./pages/FamilySharing'));
const StatsDashboard = lazy(() => import('./pages/StatsDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Scanner = lazy(() => import('./pages/Scanner'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  return (
    <Router>
      <RealtimeNotifications />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/lists" element={<MyLists />} />
            <Route path="/list-detail/:listId" element={<ListDetail />} />
            <Route path="/recipe-detail/:recipeId" element={<RecipeDetail />} />
            <Route path="/pantry" element={<PantryDashboard />} />
            <Route path="/add-item" element={<AddItem />} />
            <Route path="/edit-item/:id" element={<EditItem />} />
            <Route path="/recipe-suggestion" element={<RecipeSuggestion />} />
            <Route path="/recipe-editor" element={<RecipeEditor />} />
            <Route path="/recipe-editor/:recipeId" element={<RecipeEditor />} />
            <Route path="/meals" element={<MealPlanner />} />
            <Route path="/family" element={<FamilySharing />} />
            <Route path="/reports" element={<StatsDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/scanner" element={<Scanner />} />
          </Route>
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
