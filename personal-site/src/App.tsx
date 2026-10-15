import { Route, Routes } from 'react-router'
import Layout from './components/Layout'
import AdminLayout from './components/admin/AdminLayout'
import RequireAuth from './components/admin/RequireAuth'
import Home from './pages/Home'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import ProjectDetail from './pages/ProjectDetail'
import AddRecord from './pages/AddRecord'
import NotFound from './pages/NotFound'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import AdminProfile from './pages/admin/Profile'
import AdminSkills from './pages/admin/Skills'
import AdminProjects from './pages/admin/Projects'
import AdminPosts from './pages/admin/Posts'
import AdminSettings from './pages/admin/Settings'

export default function App() {
  return (
    <Routes>
      {/* 前台 */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="projects/:slug" element={<ProjectDetail />} />
        <Route path="add" element={<AddRecord />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* 后台（/admin，与前台路由隔离） */}
      <Route path="admin">
        <Route path="login" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="skills" element={<AdminSkills />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="projects/:slug" element={<AdminProjects />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="posts/:slug" element={<AdminPosts />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
  )
}
