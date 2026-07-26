import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ToastProvider } from './components/admin/Toast'
import ScrollToTop from './components/ScrollToTop'
import Navbar from './components/Navbar'
import ChatBot from './components/ChatBot'
import Footer from './components/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import About from './pages/About'
import Blog from './pages/Blog'
import Contact from './pages/Contact'
import CustomDesign from './pages/CustomDesign'
import Catalog from './pages/Catalog'
import EcoMap from './pages/EcoMap'
import Cart from './pages/Cart'
import OrderTracking from './pages/OrderTracking'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminMessages from './pages/admin/AdminMessages'
import AdminUsers from './pages/admin/AdminUsers'
import AdminOrders from './pages/admin/AdminOrders'
import AdminReports from './pages/admin/AdminReports'
import AdminNotifications from './pages/admin/AdminNotifications'
import AdminReviews from './pages/admin/AdminReviews'
import AdminTestimonials from './pages/admin/AdminTestimonials'
import AdminBlog from './pages/admin/AdminBlog'
import AdminSettings from './pages/admin/AdminSettings'
import AdminSEO from './pages/admin/AdminSEO'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminGeoAnalytics from './pages/admin/AdminGeoAnalytics'
import Admin3DProducts from './pages/admin/Admin3DProducts'
import AdminActivityLogs from './pages/admin/AdminActivityLogs'
import CustomerClub from './pages/CustomerClub'
import SearchResults from './pages/SearchResults'
import UserDashboard from './pages/UserDashboard'
import Gallery from './pages/Gallery'
import AdminLayout from './components/admin/AdminLayout'
import { ThemeProvider } from './components/ThemeProvider'
import { LanguageProvider } from './context/LanguageContext'
import { UserAuthProvider } from './context/UserAuthContext'
import { CartProvider } from './context/CartContext'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('adminToken')
  if (!token) return <Navigate to="/admin/login" replace />
  return <AdminLayout>{children}</AdminLayout>
}

export default function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
      <LanguageProvider>
      <UserAuthProvider>
      <CartProvider>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
        <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute><AdminNotifications /></ProtectedRoute>} />
        <Route path="/admin/reviews" element={<ProtectedRoute><AdminReviews /></ProtectedRoute>} />
        <Route path="/admin/testimonials" element={<ProtectedRoute><AdminTestimonials /></ProtectedRoute>} />
        <Route path="/admin/blog" element={<ProtectedRoute><AdminBlog /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
        <Route path="/admin/customers" element={<ProtectedRoute><AdminCustomers /></ProtectedRoute>} />
        <Route path="/admin/seo" element={<ProtectedRoute><AdminSEO /></ProtectedRoute>} />
        <Route path="/admin/geo" element={<ProtectedRoute><AdminGeoAnalytics /></ProtectedRoute>} />
        <Route path="/admin/3d" element={<ProtectedRoute><Admin3DProducts /></ProtectedRoute>} />
        <Route path="/admin/activity-logs" element={<ProtectedRoute><AdminActivityLogs /></ProtectedRoute>} />
      </Routes>
      <Routes>
        <Route element={<><ScrollToTop /><Navbar /><ChatBot /><main><Outlet /></main><Footer /></>}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/track" element={<OrderTracking />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/wholesale" element={<CustomDesign />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/farm-map" element={<EcoMap />} />
          <Route path="/customer-club" element={<CustomerClub />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/account" element={<UserDashboard />} />
        </Route>
      </Routes>
      </CartProvider>
      </UserAuthProvider>
      </LanguageProvider>
      </ThemeProvider>
    </ToastProvider>
  )
}
