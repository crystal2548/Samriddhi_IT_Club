import { Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import PublicLayout from '../components/layout/PublicLayout'
import MemberLayout from '../components/layout/MemberLayout'
import OCLayout from '../components/layout/OCLayout'

// Route Guards
import ProtectedRoute from '../components/shared/ProtectedRoute'
import OCProtectedRoute from '../components/shared/OCProtectedRoute'

// ─── Public Pages ───────────────────────────────────────────
import Home from '../pages/public/Home'
import About from '../pages/public/About'
import Events from '../pages/public/Events'
import EventDetail from '../pages/public/EventDetail'
import Projects from '../pages/public/Projects'
import ProjectDetail from '../pages/public/ProjectDetail'
import Blog from '../pages/public/Blog'
import BlogPost from '../pages/public/BlogPost'
import Resources from '../pages/public/Resources'
import Opportunities from '../pages/public/Opportunities'
import Team from '../pages/public/Team'
import Contact from '../pages/public/Contact'
import GalleryPublic from '../pages/public/Gallery'
import NotFound from '../pages/public/NotFound'

// ─── Auth Pages ─────────────────────────────────────────────
import Login from '../pages/auth/Login'
import Apply from '../pages/auth/Apply'
import Signup from '../pages/auth/Signup'
import ForgotPassword from '../pages/auth/ForgotPassword'

// ─── Member Pages ────────────────────────────────────────────
import Dashboard from '../pages/member/Dashboard'
import Profile from '../pages/member/Profile'
import MyEvents from '../pages/member/MyEvents'
import Notices from '../pages/member/Notices'
import MemberDirectory from '../pages/member/MemberDirectory'
import WriteBlog from '../pages/member/WriteBlog'
import ManageOpportunities from '../pages/member/ManageOpportunities'
import ManageProjects from '../pages/member/ManageProjects'
import Gallery from '../pages/member/Gallery'

// ─── OC Admin Pages ─────────────────────────────────────────
import OCDashboard from '../pages/oc/OCDashboard'
import OCAnalytics from '../pages/oc/OCAnalytics'
import OCMembers from '../pages/oc/OCMembers'
import OCApplications from '../pages/oc/OCApplications'
import OCRecruitment from '../pages/oc/OCRecruitment'
import OCEvents from '../pages/oc/OCEvents'
import OCBlogPosts from '../pages/oc/OCBlogPosts'
import OCProjects from '../pages/oc/OCProjects'
import OCOpportunities from '../pages/oc/OCOpportunities'
import OCResources from '../pages/oc/OCResources'
import OCAnnouncements from '../pages/oc/OCAnnouncements'
import OCSponsors from '../pages/oc/OCSponsors'
import OCPermissions from '../pages/oc/OCPermissions'
import OCSiteSettings from '../pages/oc/OCSiteSettings'
import OCMessages from '../pages/oc/OCMessages'

export default function AppRoutes() {
  return (
    <Routes>

      {/* ─── Public Routes (with Navbar + Footer) ─────────────── */}
      <Route element={<PublicLayout />}>
        <Route path="/"               element={<Home />} />
        <Route path="/about"          element={<About />} />
        <Route path="/events"         element={<Events />} />
        <Route path="/events/:id"     element={<EventDetail />} />
        <Route path="/projects"       element={<Projects />} />
        <Route path="/projects/:id"   element={<ProjectDetail />} />
        <Route path="/blog"           element={<Blog />} />
        <Route path="/blog/:slug"     element={<BlogPost />} />
        <Route path="/resources"      element={<Resources />} />
        <Route path="/opportunities"  element={<Opportunities />} />
        <Route path="/team"           element={<Team />} />
        <Route path="/gallery"        element={<GalleryPublic />} />
        <Route path="/apply"          element={<Apply />} />
        <Route path="/join"           element={<Navigate to="/apply" replace />} />
        <Route path="/contact"        element={<Contact />} />
      </Route>

      {/* ─── Auth Routes (no Navbar/Footer) ───────────────────── */}
      <Route path="/login"            element={<Login />} />
      <Route path="/signup"           element={<Signup />} />
      <Route path="/forgot-password"  element={<ForgotPassword />} />

      {/* ─── Member Portal (login required) ───────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MemberLayout />}>
          <Route path="/dashboard"              element={<Dashboard />} />
          <Route path="/dashboard/profile"      element={<Profile />} />
          <Route path="/dashboard/my-events"    element={<MyEvents />} />
          <Route path="/dashboard/notices"      element={<Notices />} />
          <Route path="/dashboard/members"      element={<MemberDirectory />} />
          {/* Executive only — guarded inside the component */}
          <Route path="/dashboard/blog/write"   element={<WriteBlog />} />
          <Route path="/dashboard/blog/:id"     element={<WriteBlog />} />
          <Route path="/dashboard/opportunities" element={<ManageOpportunities />} />
          <Route path="/dashboard/projects"     element={<ManageProjects />} />
          <Route path="/dashboard/gallery"      element={<Gallery />} />
        </Route>
      </Route>

      {/* ─── OC Admin Dashboard (OC role required) ────────────── */}
      <Route element={<OCProtectedRoute />}>
        <Route element={<OCLayout />}>
          <Route path="/oc"                     element={<Navigate to="/oc/dashboard" replace />} />
          <Route path="/oc/dashboard"           element={<OCDashboard />} />
          <Route path="/oc/analytics"           element={<OCAnalytics />} />
          <Route path="/oc/members"             element={<OCMembers />} />
          <Route path="/oc/applications"        element={<OCApplications />} />
          <Route path="/oc/recruitment"         element={<OCRecruitment />} />
          <Route path="/oc/events"              element={<OCEvents />} />
          <Route path="/oc/blog"                element={<OCBlogPosts />} />
          <Route path="/oc/projects"            element={<OCProjects />} />
          <Route path="/oc/opportunities"       element={<OCOpportunities />} />
          <Route path="/oc/resources"           element={<OCResources />} />
          <Route path="/oc/announcements"       element={<OCAnnouncements />} />
          <Route path="/oc/sponsors"            element={<OCSponsors />} />
          <Route path="/oc/permissions"         element={<OCPermissions />} />
          <Route path="/oc/settings"            element={<OCSiteSettings />} />
          <Route path="/oc/messages"            element={<OCMessages />} />
        </Route>
      </Route>

      {/* ─── 404 ──────────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  )
}