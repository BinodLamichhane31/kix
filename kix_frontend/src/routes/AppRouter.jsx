import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import AdminLayout from '../layouts/AdminLayout'
import ProtectedRoute from '../components/common/ProtectedRoute'
import LandingPage from '../features/landing/pages/LandingPage'
import ShopPage from '../features/shop/pages/ShopPage'
import SignInPage from '../features/auth/pages/SignInPage'
import SignUpPage from '../features/auth/pages/SignUpPage'
import GoogleCallbackPage from '../features/auth/pages/GoogleCallbackPage'
import ProductDetailPage from '../features/shop/pages/ProductDetailPage'
import CustomizationPage from '../features/customize/pages/CustomizationPage'
import CustomizeSneaker from '../features/customize/pages/CustomizeSneaker'
import CartPage from '../features/shop/pages/CartPage'
import CheckoutPage from '../features/shop/pages/CheckoutPage'
import DashboardOverview from '../features/dashboard/pages/DashboardOverview'
import OrdersPage from '../features/dashboard/pages/OrdersPage'
import OrderDetailPage from '../features/dashboard/pages/OrderDetailPage'
import ProfilePage from '../features/dashboard/pages/ProfilePage'
import AddressesPage from '../features/dashboard/pages/AddressesPage'
import WishlistPage from '../features/dashboard/pages/WishlistPage'
import SettingsPage from '../features/dashboard/pages/SettingsPage'
import MyDesignsPage from '../features/dashboard/pages/MyDesignsPage'
import AdminDashboard from '../features/admin/pages/AdminDashboard'
import AdminProductsPage from '../features/admin/pages/ProductsPage'
import AdminProductDetailPage from '../features/admin/pages/ProductDetailPage'
import AdminOrdersPage from '../features/admin/pages/OrdersPage'
import AdminOrderDetailPage from '../features/admin/pages/OrderDetailPage'
import AdminUsersPage from '../features/admin/pages/UsersPage'
import AdminAnalyticsPage from '../features/admin/pages/AnalyticsPage'
import AdminSettingsPage from '../features/admin/pages/SettingsPage'
import { appRoutes } from '../utils/navigation'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customize sneaker page without navbar/footer */}
        <Route path="customize/sneaker" element={<CustomizeSneaker />} />
        
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="customize" element={<CustomizationPage />} />
          <Route path="product/:slug" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="auth/sign-in" element={<SignInPage />} />
          <Route path="auth/sign-up" element={<SignUpPage />} />
          <Route path="auth/google/callback" element={<GoogleCallbackPage />} />
        </Route>

        {/* Dashboard routes with sidebar - Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="designs" element={<MyDesignsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Admin routes with sidebar - Protected with admin role */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/:id" element={<AdminProductDetailPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

