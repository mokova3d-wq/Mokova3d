"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Shield, Package, Layers, Flame, Sliders, Upload, FileText, Image as ImageIcon, HelpCircle,
  Settings, MessageSquare, Lock, LogOut, Plus, Trash2, Edit2,
  Check, X, ExternalLink, MessageCircle, Save, Sparkles
} from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "products" | "pages" | "features" | "promotions" | "sections" | "categories" | "gallery" | "faqs" | "settings" | "inquiries" | "security"
  >("products");

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [homepageSections, setHomepageSections] = useState<any[]>([]);
  const [promotionsList, setPromotionsList] = useState<any[]>([]);
  const [featureFlagsList, setFeatureFlagsList] = useState<any[]>([]);
  const [pagesList, setPagesList] = useState<any[]>([]);
  const [editingPage, setEditingPage] = useState<any | null>(null);
  const [pageEditorMode, setPageEditorMode] = useState<"edit" | "preview" | "history">("edit");
  const [pageRevisions, setPageRevisions] = useState<any[]>([]);
  const [revisionNote, setRevisionNote] = useState<string>("");
  const [editingSection, setEditingSection] = useState<any | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editingGallery, setEditingGallery] = useState<any | null>(null);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("mokova_token") : null;
    fetch("/api/admin/auth", {
      headers: (token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>,
    })
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(!!data.authenticated);
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    setIsLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("mokova_token") : null;
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const [prodRes, catRes, galRes, faqRes, cfgRes, inqRes, secRes, promoRes, featRes, pagesRes] = await Promise.all([
        fetch("/api/products?all=true", { headers: authHeaders }).then((r) => r.json()),
        fetch("/api/categories?all=true", { headers: authHeaders }).then((r) => r.json()),
        fetch("/api/gallery?all=true", { headers: authHeaders }).then((r) => r.json()),
        fetch("/api/faqs?all=true", { headers: authHeaders }).then((r) => r.json()),
        fetch("/api/site-config", { headers: authHeaders }).then((r) => r.json()),
        fetch("/api/inquiries", { headers: authHeaders }).then((r) => r.json()),
        fetch("/api/homepage-sections", { headers: authHeaders }).then((r) => r.json()),
        fetch("/api/promotions?all=true", { headers: authHeaders }).then((r) => r.json()),
        fetch("/api/features", { headers: authHeaders }).then((r) => r.json()),
        fetch("/api/pages?all=true", { headers: authHeaders }).then((r) => r.json()),
      ]);

      setProducts(Array.isArray(prodRes) ? prodRes : []);
      setCategories(Array.isArray(catRes) ? catRes : []);
      setGallery(Array.isArray(galRes) ? galRes : []);
      setFaqs(Array.isArray(faqRes) ? faqRes : []);
      setSettings(cfgRes || {});
      setInquiries(Array.isArray(inqRes) ? inqRes : []);
      setHomepageSections(Array.isArray(secRes) ? secRes : []);
      setPromotionsList(Array.isArray(promoRes) ? promoRes : []);
      setFeatureFlagsList(Array.isArray(featRes) ? featRes : []);
      setPagesList(Array.isArray(pagesRes) ? pagesRes : []);
    } catch (e) {
      console.error("Error loading data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("mokova_token", data.token);
        }
        setIsAuthenticated(true);
        loadAllData();
      } else {
        setLoginError(data.error || "Incorrect password. Default: Mokova@1234");
      }
    } catch (e) {
      setLoginError("Failed to authenticate.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    if (typeof window !== "undefined") {
      localStorage.removeItem("mokova_token");
    }
    setIsAuthenticated(false);
    setPasswordInput("");
  };

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 4000);
  };

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("mokova_token") : "";
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Product CRUD
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(editingProduct),
      });
      if (res.ok) {
        setEditingProduct(null);
        showNotification("Product saved successfully to SQLite.");
        loadAllData();
      }
    } catch (e) {
      alert("Error saving product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        showNotification("Product deleted.");
        loadAllData();
      }
    } catch (e) {
      alert("Error deleting product");
    }
  };

  // Category CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(editingCategory),
      });
      if (res.ok) {
        setEditingCategory(null);
        showNotification("Category saved.");
        loadAllData();
      }
    } catch (e) {
      alert("Error saving category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete category?")) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        showNotification("Category deleted.");
        loadAllData();
      }
    } catch (e) {
      alert("Error deleting");
    }
  };

  // Gallery CRUD
  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGallery) return;
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(editingGallery),
      });
      if (res.ok) {
        setEditingGallery(null);
        showNotification("Gallery image saved.");
        loadAllData();
      }
    } catch (e) {
      alert("Error saving gallery item");
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    try {
      const res = await fetch(`/api/gallery?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        showNotification("Gallery image deleted.");
        loadAllData();
      }
    } catch (e) {
      alert("Error deleting");
    }
  };

  // FAQ CRUD
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;
    try {
      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(editingFaq),
      });
      if (res.ok) {
        setEditingFaq(null);
        showNotification("FAQ saved.");
        loadAllData();
      }
    } catch (e) {
      alert("Error saving FAQ");
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Delete FAQ?")) return;
    try {
      const res = await fetch(`/api/faqs?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        showNotification("FAQ deleted.");
        loadAllData();
      }
    } catch (e) {
      alert("Error deleting FAQ");
    }
  };

  // Product / Gallery / Category image upload
  const [isUploadingProductImg, setIsUploadingProductImg] = useState(false);
  const productImgInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingGalleryImg, setIsUploadingGalleryImg] = useState(false);
  const galleryImgInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCategoryImg, setIsUploadingCategoryImg] = useState(false);
  const categoryImgInputRef = useRef<HTMLInputElement>(null);

  // Site Settings
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingMobileHero, setIsUploadingMobileHero] = useState(false);
  const heroMobileFileInputRef = useRef<HTMLInputElement>(null);

  const handleMobileHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setIsUploadingMobileHero(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = typeof window !== "undefined" ? localStorage.getItem("mokova_token") : "";
      const res = await fetch("/api/admin/upload-hero", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setSettings((prev) => ({ ...prev, heroMobileImage: data.url }));
        showNotification("Mobile hero image uploaded! Click Publish to save.");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err: any) {
      alert("Error uploading mobile image");
    } finally {
      setIsUploadingMobileHero(false);
    }
  };

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setIsUploadingHero(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = typeof window !== "undefined" ? localStorage.getItem("mokova_token") : "";
      const res = await fetch("/api/admin/upload-hero", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setSettings((prev) => ({ ...prev, heroImage: data.url }));
        showNotification("New hero image uploaded! Click Save Settings to persist.");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err: any) {
      alert("Error uploading image");
    } finally {
      setIsUploadingHero(false);
    }
  };

  // Generic image upload helper reused for product/gallery/category images
  const uploadImageFile = async (
    file: File,
    setUploading: (v: boolean) => void,
    onSuccess: (url: string) => void,
    label: string
  ) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prefix", label.toLowerCase().replace(/[^a-z0-9]/g, "_"));
      const token = typeof window !== "undefined" ? localStorage.getItem("mokova_token") : "";
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        onSuccess(data.url);
        const savedPct = data.compressionRatio ? Math.round((1 - data.compressionRatio) * 100) : 0;
        showNotification(
          `${label} converted to WebP & optimized${savedPct > 0 ? ` (${savedPct}% smaller)` : ""}!`
        );
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showNotification("Site settings saved & cache invalidated.");
      }
    } catch (e) {
      alert("Error saving settings");
    }
  };

  const [isMigratingImages, setIsMigratingImages] = useState(false);
  const [isRollingBackImages, setIsRollingBackImages] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState("");

  const handleTriggerMigration = async () => {
    setIsMigratingImages(true);
    setMigrationStatus("Scanning and converting catalog and gallery images to WebP...");
    try {
      const res = await fetch("/api/admin/migrate-images", {
        method: "POST",
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (res.ok) {
        setMigrationStatus(data.message || "Migration completed successfully!");
        showNotification(data.message || "Images migrated to WebP!");
        loadAllData();
      } else {
        setMigrationStatus(`Migration error: ${data.error || "Failed"}`);
      }
    } catch (err: any) {
      setMigrationStatus(`Network error during migration: ${err.message}`);
    } finally {
      setIsMigratingImages(false);
    }
  };

  const handleTriggerRollback = async () => {
    if (!confirm("Are you sure you want to rollback WebP image references to originals?")) return;
    setIsRollingBackImages(true);
    setMigrationStatus("Rolling back image references...");
    try {
      const res = await fetch("/api/admin/migrate-images", {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (res.ok) {
        setMigrationStatus(data.message || "Rollback completed!");
        showNotification(data.message || "Rollback completed!");
        loadAllData();
      } else {
        setMigrationStatus(`Rollback error: ${data.error || "Failed"}`);
      }
    } catch (err: any) {
      setMigrationStatus(`Network error during rollback: ${err.message}`);
    } finally {
      setIsRollingBackImages(false);
    }
  };

  // Inquiries
  const handleUpdateInquiryStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        showNotification(`Inquiry status updated to ${status}.`);
        loadAllData();
      }
    } catch (e) {
      alert("Error updating status");
    }
  };

  // Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ newPassword }),
      });
      if (res.ok) {
        setNewPassword("");
        showNotification("Password changed successfully.");
      } else {
        alert("Failed to change password.");
      }
    } catch (e) {
      alert("Error changing password.");
    }
  };

  // Pages CMS Handlers
  const handleOpenPageEditor = async (page: any) => {
    setEditingPage({ ...page });
    setPageEditorMode("edit");
    setRevisionNote("");
    try {
      const res = await fetch(`/api/pages?slug=${page.slug}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data && Array.isArray(data.revisions)) {
        setPageRevisions(data.revisions);
      } else {
        setPageRevisions([]);
      }
    } catch (e) {
      setPageRevisions([]);
    }
  };

  const handleSavePage = async (publishStatus: number) => {
    if (!editingPage) return;
    try {
      const payload = {
        ...editingPage,
        published: publishStatus,
        revision_note: revisionNote || (publishStatus ? "Published version update" : "Saved draft"),
      };

      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotification(`Page ${editingPage.title} (${publishStatus ? "Published" : "Draft"}) saved.`);
        setEditingPage(null);
        loadAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save page");
      }
    } catch (e) {
      alert("Error saving page");
    }
  };

  const handleDeletePage = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete page /${slug}?`)) return;
    try {
      const res = await fetch(`/api/pages?slug=${slug}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        showNotification("Page deleted.");
        loadAllData();
      }
    } catch (e) {
      alert("Error deleting page");
    }
  };

  const insertFormatting = (tagOpen: string, tagClose: string) => {
    if (!editingPage) return;
    const current = editingPage.content_html || "";
    setEditingPage({
      ...editingPage,
      content_html: current + `\n${tagOpen}Sample Content${tagClose}`,
    });
  };

  const handleToggleFeature = async (flagId: string, currentEnabled: number) => {
    try {
      const res = await fetch("/api/features", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ id: flagId, enabled: currentEnabled === 1 ? false : true }),
      });
      if (res.ok) {
        showNotification(`Feature ${flagId} toggled.`);
        loadAllData();
      }
    } catch (e) {
      alert("Error toggling feature");
    }
  };

  // Homepage Sections Handlers
  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;
    try {
      const res = await fetch("/api/homepage-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(editingSection),
      });
      if (res.ok) {
        setEditingSection(null);
        showNotification("Homepage section updated.");
        loadAllData();
      }
    } catch (e) {
      alert("Error saving section");
    }
  };

  const handleToggleSection = async (sec: any) => {
    try {
      const updated = { ...sec, enabled: sec.enabled ? 0 : 1 };
      const res = await fetch("/api/homepage-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        showNotification(`Section ${sec.id} is now ${updated.enabled ? "Enabled" : "Disabled"}.`);
        loadAllData();
      }
    } catch (e) {
      alert("Error toggling section");
    }
  };

  // Promotion Handlers
  const handleSavePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromotion) return;
    try {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(editingPromotion),
      });
      const data = await res.json();
      if (res.ok) {
        setEditingPromotion(null);
        showNotification("Promotion scheduled successfully.");
        loadAllData();
      } else {
        alert(data.error || "Failed to save promotion");
      }
    } catch (e) {
      alert("Error saving promotion");
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (!confirm("Delete this scheduled promotion?")) return;
    try {
      const res = await fetch(`/api/promotions?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        showNotification("Promotion deleted.");
        loadAllData();
      }
    } catch (e) {
      alert("Error deleting promotion");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0e0c1d] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#5a45ff]/10 text-[#5a45ff] rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold font-display text-[#0e0c1d]">Mokova3D Admin</h1>
            <p className="text-xs text-[#6a6880]">Secure SQLite Dashboard & Content Management</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Admin Password</label>
              <input
                type="password"
                placeholder="Enter admin password (Default: Mokova@1234)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 bg-[#faf9f7] border border-black/10 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#5a45ff]"
                required
              />
              <span className="text-[11px] text-[#6a6880] mt-1 block">
                Default password: <code className="font-mono text-[#5a45ff]">Mokova@1234</code>
              </span>
            </div>

            {loginError && <p className="text-xs text-red-600 font-bold">{loginError}</p>}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#0e0c1d] hover:bg-[#5a45ff] text-white font-bold text-sm transition-colors cursor-pointer"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="text-center">
            <Link href="/" className="text-xs text-[#5a45ff] hover:underline">
              ? Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#0e0c1d]">
      <header className="sticky top-0 z-30 bg-[#0e0c1d] text-white border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/assets/logo.png" alt="Mokova3D" className="h-6 w-auto brightness-0 invert" />
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#5a45ff] text-white">
              ADMIN v2
            </span>
          </Link>
          <span className="text-xs font-mono text-[#c8f542] hidden sm:inline">
            ? SQLite Persistent
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-white/80 hover:text-[#c8f542] transition-colors"
          >
            <span>Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {statusMessage && (
        <div className="bg-emerald-500 text-slate-950 font-bold text-xs text-center py-2 px-4 animate-in fade-in">
          ? {statusMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-black/10">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "products"
                ? "bg-[#5a45ff] text-white shadow-sm"
                : "bg-white border border-black/10 text-[#6a6880] hover:text-[#0e0c1d]"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("pages")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "pages"
                ? "bg-[#5a45ff] text-white shadow-sm"
                : "bg-white border border-black/10 text-[#6a6880] hover:text-[#0e0c1d]"
            }`}
          >
            <FileText className="w-4 h-4 text-[#5a45ff]" />
            <span>Pages &amp; Legal CMS ({pagesList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("features")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "features"
                ? "bg-[#5a45ff] text-white shadow-sm"
                : "bg-white border border-black/10 text-[#6a6880] hover:text-[#0e0c1d]"
            }`}
          >
            <Shield className="w-4 h-4 text-[#5a45ff]" />
            <span>Feature Toggles ({featureFlagsList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("promotions")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "promotions"
                ? "bg-[#5a45ff] text-white shadow-sm"
                : "bg-white border border-black/10 text-[#6a6880] hover:text-[#0e0c1d]"
            }`}
          >
            <Flame className="w-4 h-4 text-[#f59e0b]" />
            <span>Flash Promotions ({promotionsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("sections")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "sections"
                ? "bg-[#5a45ff] text-white shadow-sm"
                : "bg-white border border-black/10 text-[#6a6880] hover:text-[#0e0c1d]"
            }`}
          >
            <Sliders className="w-4 h-4 text-[#c8f542]" />
            <span>Homepage Sections ({homepageSections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "categories"
                ? "bg-[#5a45ff] text-white shadow-sm"
                : "bg-white border border-black/10 text-[#6a6880] hover:text-[#0e0c1d]"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("gallery")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "gallery"
                ? "bg-[#5a45ff] text-white shadow-sm"
                : "bg-white border border-black/10 text-[#6a6880] hover:text-[#0e0c1d]"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Gallery ({gallery.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("faqs")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "faqs"
                ? "bg-[#5a45ff] text-white shadow-sm"
                : "bg-white border border-black/10 text-[#6a6880] hover:text-[#0e0c1d]"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>FAQs ({faqs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "inquiries"
                ? "bg-[#5a45ff] text-white shadow-sm"
                : "bg-white border border-black/10 text-[#6a6880] hover:text-[#0e0c1d]"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Price Offers / Inquiries ({inquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "settings"
                ? "bg-[#5a45ff] text-white shadow-sm"
                : "bg-white border border-black/10 text-[#6a6880] hover:text-[#0e0c1d]"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Site Content & Banners</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "security"
                ? "bg-[#5a45ff] text-white shadow-sm"
                : "bg-white border border-black/10 text-[#6a6880] hover:text-[#0e0c1d]"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </button>
        </div>

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-[#0e0c1d]">Product Catalog</h2>
                <p className="text-xs text-[#6a6880]">
                  Manage 3D models, prices, images, specifications, and visibility in SQLite.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingProduct({
                    id: `prod-${Date.now()}`,
                    name: "",
                    category_id: "home-decor",
                    price: "?349",
                    reference_price: 349,
                    min_offer_floor: 280,
                    pricing_model: "FIXED_OR_HAGGLE",
                    image: "/assets/products/cat.jpg",
                    gallery: "[]",
                    description: "",
                    full_overview: "",
                    sku: `MKV-${Date.now().toString().slice(-4)}`,
                    dimensions: "90 ? 80 ? 120 mm",
                    material: "PLA Matte",
                    weight: "100g",
                    layer_height: "0.16 mm",
                    infill: "20%",
                    print_time: "5 Hours",
                    model_3d_type: "cat",
                    featured: 0,
                    active: 1,
                    sort_order: products.length + 1,
                  })
                }
                className="btn dark text-xs font-bold py-2.5 px-4 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf9f7] text-[#6a6880] font-bold border-b border-black/10 uppercase text-[11px]">
                    <tr>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5">Haggle Floor</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">3D Model</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-[#faf9f7] transition-colors">
                        <td className="p-3.5 flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-lg border border-black/10 shrink-0"
                          />
                          <div>
                            <strong className="block text-[#0e0c1d] font-bold text-sm">
                              {p.name}
                            </strong>
                            <span className="text-[11px] text-[#6a6880] font-mono">{p.sku}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-[#0e0c1d] font-semibold">{p.category_id}</td>
                        <td className="p-3.5 font-bold text-[#5a45ff]">{p.price}</td>
                        <td className="p-3.5 font-mono text-emerald-700">
                          ?{p.min_offer_floor || 0}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {p.active ? "Active" : "Hidden"}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-[#5a45ff]">
                          {p.model_3d_type || "default"}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setEditingProduct({ ...p })}
                            className="p-1.5 rounded-lg bg-[#eeedfb] text-[#5a45ff] hover:bg-[#5a45ff] hover:text-white transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        
        
        
        {/* PAGES & LEGAL CMS TAB */}
        {activeTab === "pages" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold font-display text-[#0e0c1d]">
                  Legal &amp; Informational Pages CMS ({pagesList.length})
                </h2>
                <p className="text-xs text-[#6a6880]">
                  Manage rich-text content, statutory Indian disclosures, policies, and revision history without touching code.
                </p>
              </div>

              <button
                onClick={() =>
                  handleOpenPageEditor({
                    slug: `custom-page-${Date.now().toString().slice(-4)}`,
                    title: "New Policy Page",
                    category: "Legal & Compliance",
                    summary: "",
                    content_html: "<h2>1. Introduction</h2>\n<p>Enter policy terms and conditions here.</p>",
                    published: 1,
                    version: 1,
                    legal_review_flagged: 1,
                  })
                }
                className="btn dark text-xs font-bold py-2.5 px-4 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Page</span>
              </button>
            </div>

            <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf9f7] text-[#6a6880] font-bold border-b border-black/10 uppercase text-[11px]">
                    <tr>
                      <th className="p-3.5">Page Title &amp; URL Route</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Version &amp; Updated</th>
                      <th className="p-3.5">Legal Review</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {pagesList.map((pg) => (
                      <tr key={pg.slug} className="hover:bg-[#faf9f7] transition-colors">
                        <td className="p-3.5">
                          <strong className="block text-sm font-bold text-[#0e0c1d] font-display">
                            {pg.title}
                          </strong>
                          <span className="text-[11px] font-mono text-[#5a45ff]">
                            /{pg.slug}
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-[#0e0c1d]">
                          {pg.category}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              pg.published
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {pg.published ? "? PUBLISHED" : "DRAFT (UNPUBLISHED)"}
                          </span>
                        </td>
                        <td className="p-3.5 text-[11px] font-mono text-[#6a6880]">
                          <div>Version {pg.version}.0</div>
                          <div className="text-[10px] text-[#94a3b8]">{pg.last_updated?.slice(0, 10)}</div>
                        </td>
                        <td className="p-3.5">
                          {pg.legal_review_flagged ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              Flagged for Counsel
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700">Verified</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleOpenPageEditor(pg)}
                            className="p-1.5 rounded-lg bg-[#eeedfb] text-[#5a45ff] hover:bg-[#5a45ff] hover:text-white transition-colors cursor-pointer"
                            title="Edit with Rich-Text Editor"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            href={`/${pg.slug}`}
                            target="_blank"
                            className="inline-block p-1.5 rounded-lg border border-black/10 text-[#6a6880] hover:text-[#0e0c1d] transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDeletePage(pg.slug)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                            title="Delete Page"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* FEATURE FLAGS TAB */}
        {activeTab === "features" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold font-display text-[#0e0c1d]">
                  Central Feature Management &amp; Toggles ({featureFlagsList.length})
                </h2>
                <p className="text-xs text-[#6a6880]">
                  Enable or disable modular features across the platform. Persisted in SQLite with instant cache invalidation.
                </p>
              </div>

              <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                Server-Enforced Authorization
              </div>
            </div>

            <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm divide-y divide-black/5">
              {featureFlagsList.map((f) => (
                <div
                  key={f.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#faf9f7] transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#5a45ff] bg-[#eeedfb] px-2 py-0.5 rounded-md">
                        {f.category}
                      </span>
                      <strong className="text-base text-[#0e0c1d] font-display">{f.name}</strong>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          f.is_implemented
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {f.is_implemented ? "IMPLEMENTED NOW" : "FUTURE MODULE (REGISTERED)"}
                      </span>
                    </div>

                    <p className="text-xs text-[#6a6880] max-w-2xl leading-relaxed">{f.description}</p>
                    <span className="text-[10px] font-mono text-[#6a6880] block">
                      ID: {f.id} ? Last Updated: {f.updated_at}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleToggleFeature(f.id, f.enabled)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        f.enabled
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                          : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                      }`}
                    >
                      {f.enabled ? "? ENABLED" : "? DISABLED"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROMOTIONS TAB */}
        {activeTab === "promotions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-[#0e0c1d]">
                  Flash Promotions & Studio Runs ({promotionsList.length})
                </h2>
                <p className="text-xs text-[#6a6880]">
                  Configure limited-time promotional pricing. Authoritative countdown timers and discount validation enforced.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingPromotion({
                    id: `promo-${Date.now()}`,
                    product_id: products[0]?.id || "cat",
                    title: "Special Weekend Run",
                    sale_price: 249,
                    start_time: new Date().toISOString(),
                    end_time: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
                    badge: "FLASH SALE",
                    active: 1,
                  })
                }
                className="btn dark text-xs font-bold py-2.5 px-4 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Promotion</span>
              </button>
            </div>

            <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf9f7] text-[#6a6880] font-bold border-b border-black/10 uppercase text-[11px]">
                    <tr>
                      <th className="p-3.5">Promo Title & Badge</th>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Sale Price vs Ref</th>
                      <th className="p-3.5">Active Window (Start ? End)</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {promotionsList.map((pr) => {
                      const isExpired = new Date(pr.end_time).getTime() <= Date.now();
                      const targetProd = products.find((p) => p.id === pr.product_id);

                      return (
                        <tr key={pr.id} className="hover:bg-[#faf9f7] transition-colors">
                          <td className="p-3.5">
                            <span className="font-bold text-sm text-[#0e0c1d] block">{pr.title}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] font-bold">
                              {pr.badge}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-[#0e0c1d]">
                              {targetProd?.name || pr.product_id}
                            </span>
                            <span className="text-[10px] text-[#6a6880] block font-mono">
                              SKU: {targetProd?.sku}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono">
                            <span className="font-bold text-[#5a45ff] text-sm">?{pr.sale_price}</span>
                            <span className="text-[#6a6880] text-xs line-through ml-2">
                              ?{targetProd?.reference_price || pr.product?.reference_price}
                            </span>
                          </td>
                          <td className="p-3.5 text-[11px] font-mono text-[#6a6880]">
                            <div>Start: {new Date(pr.start_time).toLocaleString()}</div>
                            <div>End: {new Date(pr.end_time).toLocaleString()}</div>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isExpired
                                  ? "bg-slate-100 text-slate-600"
                                  : pr.active
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {isExpired ? "EXPIRED" : pr.active ? "LIVE ACTIVE" : "PAUSED"}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            <button
                              onClick={() => setEditingPromotion({ ...pr })}
                              className="p-1.5 rounded-lg bg-[#eeedfb] text-[#5a45ff] hover:bg-[#5a45ff] hover:text-white transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePromotion(pr.id)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* HOMEPAGE SECTIONS TAB */}
        {activeTab === "sections" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-[#0e0c1d]">
                  Homepage Structure & Sections ({homepageSections.length})
                </h2>
                <p className="text-xs text-[#6a6880]">
                  Enable, disable, rename, and reorder homepage sections without modifying code.
                </p>
              </div>

              <div className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                Live Storefront Synchronized
              </div>
            </div>

            <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm divide-y divide-black/5">
              {homepageSections.map((sec) => (
                <div
                  key={sec.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#faf9f7] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#5a45ff] bg-[#eeedfb] px-2 py-0.5 rounded-md">
                        {sec.id.toUpperCase()}
                      </span>
                      <strong className="text-base text-[#0e0c1d] font-display">{sec.title}</strong>
                      <span className="text-[10px] font-mono text-[#6a6880]">
                        Order #{sec.sort_order}
                      </span>
                    </div>
                    <p className="text-xs text-[#6a6880] max-w-xl">{sec.subtitle}</p>
                    <span className="text-[10px] font-mono text-[#5a45ff] block">
                      Layout Engine: {sec.layout_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleToggleSection(sec)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        sec.enabled
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-slate-100 text-slate-600 border border-slate-300"
                      }`}
                    >
                      {sec.enabled ? "? Enabled" : "? Disabled"}
                    </button>

                    <button
                      onClick={() => setEditingSection({ ...sec })}
                      className="p-2 rounded-xl bg-[#eeedfb] text-[#5a45ff] hover:bg-[#5a45ff] hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === "categories" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-[#0e0c1d]">Categories</h2>
                <p className="text-xs text-[#6a6880]">Manage product categories & bento images.</p>
              </div>

              <button
                onClick={() =>
                  setEditingCategory({
                    id: `cat-${Date.now()}`,
                    name: "",
                    description: "",
                    image: "/assets/hero.jpg",
                    sort_order: categories.length + 1,
                    active: 1,
                  })
                }
                className="btn dark text-xs font-bold py-2.5 px-4 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border border-black/10 rounded-2xl overflow-hidden p-4 space-y-3"
                >
                  <img src={c.image} alt={c.name} className="w-full h-32 object-cover rounded-xl" />
                  <div>
                    <h3 className="font-bold text-sm text-[#0e0c1d]">{c.name}</h3>
                    <p className="text-xs text-[#6a6880] line-clamp-2 mt-1">{c.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-black/5 text-xs">
                    <span className="font-mono text-[#6a6880]">Order: {c.sort_order}</span>
                    <div className="space-x-1.5">
                      <button
                        onClick={() => setEditingCategory({ ...c })}
                        className="p-1.5 rounded-lg bg-[#eeedfb] text-[#5a45ff] hover:bg-[#5a45ff] hover:text-white transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === "gallery" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-[#0e0c1d]">
                  Client Prints Gallery ({gallery.length})
                </h2>
                <p className="text-xs text-[#6a6880]">
                  Add, edit and manage real customer 3D print photos.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingGallery({
                    id: `gal-${Date.now()}`,
                    src: "/assets/products/cat.jpg",
                    title: "New 3D Print",
                    category_id: "home-decor",
                    tag: "Client Print",
                    active: 1,
                    sort_order: gallery.length + 1,
                  })
                }
                className="btn dark text-xs font-bold py-2.5 px-4 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Gallery Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {gallery.map((g) => (
                <div
                  key={g.id}
                  className="bg-white border border-black/10 rounded-xl overflow-hidden p-2 space-y-2 group"
                >
                  <img src={g.src} alt={g.title} className="w-full aspect-square object-cover rounded-lg" />
                  <div className="space-y-1">
                    <span className="block font-bold text-xs text-[#0e0c1d] truncate">{g.title}</span>
                    <span className="block text-[10px] text-[#5a45ff]">{g.tag}</span>
                  </div>
                  <div className="flex justify-end gap-1 pt-1">
                    <button
                      onClick={() => setEditingGallery({ ...g })}
                      className="p-1 rounded bg-[#eeedfb] text-[#5a45ff] hover:bg-[#5a45ff] hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteGallery(g.id)}
                      className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQS TAB */}
        {activeTab === "faqs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-[#0e0c1d]">Frequently Asked Questions</h2>
                <p className="text-xs text-[#6a6880]">Edit storefront FAQs without code changes.</p>
              </div>

              <button
                onClick={() =>
                  setEditingFaq({
                    id: `faq-${Date.now()}`,
                    question: "",
                    answer: "",
                    active: 1,
                    sort_order: faqs.length + 1,
                  })
                }
                className="btn dark text-xs font-bold py-2.5 px-4 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="space-y-3">
              {faqs.map((f) => (
                <div
                  key={f.id}
                  className="bg-white border border-black/10 rounded-2xl p-5 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <h3 className="font-bold text-sm text-[#0e0c1d]">{f.question}</h3>
                    <p className="text-xs text-[#6a6880] leading-relaxed">{f.answer}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditingFaq({ ...f })}
                      className="p-2 rounded-xl bg-[#eeedfb] text-[#5a45ff] hover:bg-[#5a45ff] hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(f.id)}
                      className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INQUIRIES TAB */}
        {activeTab === "inquiries" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold font-display text-[#0e0c1d]">
                Buyer Price Counter-Offers & Inquiries ({inquiries.length})
              </h2>
              <p className="text-xs text-[#6a6880]">
                All price negotiations submitted by buyers on the site. Persisted directly in SQLite.
              </p>
            </div>

            {inquiries.length === 0 ? (
              <div className="p-12 text-center bg-white border border-black/10 rounded-2xl text-xs text-[#6a6880]">
                No customer inquiries logged yet.
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inq) => {
                  const cleanPhone = (inq.buyer_phone || "").replace(/[^0-9]/g, "");
                  const waReplyUrl = cleanPhone
                    ? `https://wa.me/${cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone}?text=Hi%20${encodeURIComponent(
                        inq.buyer_name
                      )}!%20Regarding%20your%20offer%20for%20${encodeURIComponent(
                        inq.product_name
                      )}%20at%20?${inq.proposed_price}%20on%20Mokova3D:`
                    : null;

                  return (
                    <div
                      key={inq.id}
                      className="bg-white border border-black/10 rounded-2xl p-5 space-y-3 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#0e0c1d]">{inq.buyer_name}</span>
                          <span className="text-xs font-mono text-[#6a6880]">? {inq.buyer_phone}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              inq.type === "OFFER" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"
                            }`}
                          >
                            {inq.type === "OFFER" ? "PRICE HAGGLE OFFER" : "QUOTE INQUIRY"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={inq.status}
                            onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                            className="bg-[#faf9f7] border border-black/10 rounded-lg px-2.5 py-1 text-xs font-bold text-[#0e0c1d]"
                          >
                            <option value="NEW">NEW</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="ACCEPTED">ACCEPTED</option>
                            <option value="DECLINED">DECLINED</option>
                          </select>

                          {waReplyUrl && (
                            <a
                              href={waReplyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-[#25D366] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Reply on WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-[#6a6880] block text-[11px]">Product:</span>
                          <strong className="text-[#0e0c1d]">{inq.product_name}</strong>
                        </div>
                        <div>
                          <span className="text-[#6a6880] block text-[11px]">Proposed Price:</span>
                          <strong className="text-[#5a45ff] text-sm">
                            ?{inq.proposed_price} ? {inq.quantity} unit(s)
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#6a6880] block text-[11px]">Submitted:</span>
                          <span className="font-mono text-[#6a6880]">{inq.created_at}</span>
                        </div>
                      </div>

                      {inq.rationale && (
                        <div className="p-3 bg-[#faf9f7] rounded-xl text-xs text-[#0e0c1d] border border-black/5">
                          <span className="text-[#6a6880] text-[11px] block font-semibold mb-0.5">
                            Buyer Justification Note:
                          </span>
                          &ldquo;{inq.rationale}&rdquo;
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

                {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="max-w-4xl bg-white border border-black/10 rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#eeedfb] text-xs font-mono font-bold text-[#5a45ff]">
                  HERO &amp; SITE ENGINE
                </span>
                <h2 className="text-2xl font-bold font-display text-[#0e0c1d]">
                  Homepage Hero &amp; Brand Settings
                </h2>
              </div>
              <p className="text-xs text-[#6a6880] mt-1">
                Manage hero typography, imagery, focal position, button links, and announcement bar. Changes immediately persist to SQLite and refresh storefront caches.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* === LIVE HERO PREVIEW PANEL === */}
              <div className="rounded-3xl overflow-hidden border border-black/10 shadow-sm bg-[#faf9f7]">
                <div className="flex items-center justify-between px-5 py-3 border-b border-black/10 bg-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-[#0e0c1d] font-mono">LIVE HERO PREVIEW</span>
                  </div>
                  <span className="text-[10px] text-[#6a6880] font-mono">Updates as you edit below</span>
                </div>
                {/* Hero preview matching the actual homepage layout */}
                <div className="relative grid grid-cols-1 sm:grid-cols-12 gap-6 p-6 items-center overflow-hidden">
                  {/* Warm ambient shapes */}
                  <div className="absolute top-0 left-1/4 w-[300px] h-[200px] bg-[#FEF3C7]/50 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute top-4 right-8 w-[200px] h-[180px] bg-[#FDE68A]/40 rounded-full blur-3xl pointer-events-none" />
                  {/* Left: Text */}
                  <div className="sm:col-span-6 space-y-3 z-10">
                    <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#111827] leading-[1.1] whitespace-pre-line">
                      {settings.heroTitle || "Small Things\nBig Happiness"}
                    </h2>
                    <p className="text-sm text-[#4b5563] leading-relaxed whitespace-pre-line">
                      {settings.heroSubtitle || "Discover playful, eco-friendly 3D printed toys crafted with care."}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="px-5 py-2 rounded-full bg-[#FBBF24] text-[#111827] font-bold text-xs">
                        {settings.heroPrimaryBtnText || "Shop Now"}
                      </span>
                      <span className="px-5 py-2 rounded-full bg-white border border-black/15 text-[#111827] font-bold text-xs">
                        {settings.heroSecondaryBtnText || "Custom Print"}
                      </span>
                    </div>
                  </div>
                  {/* Right: Image */}
                  <div className="sm:col-span-6 z-10">
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/60 shadow-lg">
                      <img
                        src={settings.heroImage || "/assets/hero-banner.png"}
                        alt={settings.heroAltText || "Hero preview"}
                        style={{ objectPosition: settings.heroFocalPosition || "center" }}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/assets/hero-banner.png"; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2 left-2 text-[10px] font-mono font-bold text-white bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {settings.heroFocalPosition || "center"} focal
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Image Management & Live Preview */}
              <div className="p-6 rounded-3xl bg-[#faf9f7] border border-black/10 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-black/10">
                  <div>
                    <h3 className="font-bold text-sm text-[#0e0c1d] font-display">
                      Hero Imagery &amp; Media Uploader
                    </h3>
                    <p className="text-xs text-[#6a6880]">
                      Upload, replace, and adjust focal point for desktop and mobile hero images. Paths are stored internally.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#5a45ff] font-bold bg-[#eeedfb] px-2.5 py-1 rounded-full">
                    FILE UPLOADER
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Desktop Hero Image Section (7 cols) */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0e0c1d]">
                        Primary Desktop Hero Image
                      </span>
                      {settings.heroImage && (
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                          ? Image Loaded
                        </span>
                      )}
                    </div>

                    {/* Image Preview Window */}
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black/5 border border-black/10 shadow-sm group">
                      <img
                        src={settings.heroImage || "/assets/hero-banner.png"}
                        alt={settings.heroAltText || "Hero preview"}
                        style={{ objectPosition: settings.heroFocalPosition || "center" }}
                        className="w-full h-full object-cover transition-all"
                      />
                      {isUploadingHero && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-mono font-bold">Uploading to Server...</span>
                        </div>
                      )}
                    </div>

                    {/* Drag-and-drop / Upload & Replace Controls */}
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          const fakeEvent = { target: { files: e.dataTransfer.files } } as any;
                          handleHeroFileUpload(fakeEvent);
                        }
                      }}
                      className="p-4 border-2 border-dashed border-[#5a45ff]/30 hover:border-[#5a45ff] bg-white rounded-2xl text-center space-y-2 transition-colors cursor-pointer"
                      onClick={() => heroFileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={heroFileInputRef}
                        onChange={handleHeroFileUpload}
                        accept="image/png,image/jpeg,image/webp,image/avif"
                        className="hidden"
                      />

                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#5a45ff]">
                        <Upload className="w-4 h-4" />
                        <span>{isUploadingHero ? "Uploading..." : "Click or Drag File to Replace Hero Image"}</span>
                      </div>
                      <p className="text-[11px] text-[#6a6880]">
                        Supports PNG, JPG, WebP, AVIF up to 10MB.
                      </p>
                    </div>

                    {/* Actions: Replace / Reset */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => heroFileInputRef.current?.click()}
                        disabled={isUploadingHero}
                        className="px-4 py-2 rounded-xl bg-[#0e0c1d] hover:bg-[#5a45ff] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#c8f542]" />
                        <span>Replace Image</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSettings((prev) => ({ ...prev, heroImage: "/assets/hero-banner.png" }));
                          showNotification("Hero image reset to default.");
                        }}
                        className="px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-red-50 text-xs font-bold text-red-600 transition-colors cursor-pointer"
                      >
                        Reset to Default
                      </button>
                    </div>
                  </div>

                  {/* Focal Position, Alt Text & Mobile Image (5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Focal point selector */}
                    <div className="p-4 bg-white rounded-2xl border border-black/10 space-y-2">
                      <label className="block text-xs font-bold text-[#0e0c1d]">
                        Cropping / Focal Point Alignment
                      </label>
                      <select
                        value={settings.heroFocalPosition || "center"}
                        onChange={(e) =>
                          setSettings({ ...settings, heroFocalPosition: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                      >
                        <option value="center">Center (Default 50% 50%)</option>
                        <option value="top">Top (Anchor to Top)</option>
                        <option value="bottom">Bottom (Anchor to Bottom)</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                      <p className="text-[11px] text-[#6a6880]">
                        Controls how the image is anchored on ultra-wide or narrow screens.
                      </p>
                    </div>

                    {/* Alt text field */}
                    <div className="p-4 bg-white rounded-2xl border border-black/10 space-y-2">
                      <label className="block text-xs font-bold text-[#0e0c1d]">
                        Image Alt Text (SEO &amp; Screen Readers)
                      </label>
                      <input
                        type="text"
                        value={settings.heroAltText || ""}
                        onChange={(e) => setSettings({ ...settings, heroAltText: e.target.value })}
                        className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                        placeholder="Small Things Big Happiness - 3D Printed Cat and Penguin"
                      />
                    </div>

                    {/* Optional Mobile Image Uploader */}
                    <div className="p-4 bg-white rounded-2xl border border-black/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-[#0e0c1d]">
                          Optional Mobile Hero Image
                        </label>
                        {settings.heroMobileImage && (
                          <button
                            type="button"
                            onClick={() => {
                              setSettings((prev) => ({ ...prev, heroMobileImage: "" }));
                              showNotification("Mobile hero image removed.");
                            }}
                            className="text-[10px] text-red-600 font-bold hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {settings.heroMobileImage ? (
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-black/10 bg-black/5">
                          <img
                            src={settings.heroMobileImage}
                            alt="Mobile Hero preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="p-3 bg-[#faf9f7] rounded-xl text-center text-xs text-[#6a6880]">
                          No mobile-specific image set. (Using desktop image)
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => heroMobileFileInputRef.current?.click()}
                        disabled={isUploadingMobileHero}
                        className="w-full py-2 px-3 rounded-xl border border-black/10 bg-[#faf9f7] hover:bg-[#eeedfb] text-xs font-bold text-[#0e0c1d] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#5a45ff]" />
                        <span>{isUploadingMobileHero ? "Uploading..." : settings.heroMobileImage ? "Replace Mobile Image" : "Upload Mobile-Specific Image"}</span>
                      </button>

                      <input
                        type="file"
                        ref={heroMobileFileInputRef}
                        onChange={handleMobileHeroFileUpload}
                        accept="image/png,image/jpeg,image/webp,image/avif"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography Section */}
              <div className="p-5 rounded-2xl bg-[#faf9f7] border border-black/10 space-y-4">
                <h3 className="font-bold text-sm text-[#0e0c1d] font-display">Hero Typography &amp; Copy</h3>

                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">
                    Display Headline (Supports multi-line with Enter)
                  </label>
                  <textarea
                    value={settings.heroTitle || ""}
                    onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-white border border-black/10 rounded-xl text-sm font-bold font-display"
                    placeholder="Small Things&#10;Big Happiness"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">
                    Hero Subtitle / Description
                  </label>
                  <textarea
                    value={settings.heroSubtitle || ""}
                    onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-white border border-black/10 rounded-xl text-xs font-semibold"
                    placeholder="Discover playful, eco-friendly 3D printed toys crafted with care.&#10;Designed to delight, built to last."
                    required
                  />
                </div>
              </div>

              {/* Action Buttons & Links */}
              <div className="p-5 rounded-2xl bg-[#faf9f7] border border-black/10 space-y-4">
                <h3 className="font-bold text-sm text-[#0e0c1d] font-display">Call-to-Action Pill Buttons</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-white rounded-xl border border-black/10 space-y-2">
                    <span className="block text-[11px] font-bold text-[#f59e0b] uppercase font-mono">
                      Primary CTA Button
                    </span>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0e0c1d] mb-0.5">Button Label</label>
                      <input
                        type="text"
                        value={settings.heroPrimaryBtnText || "Shop Now"}
                        onChange={(e) => setSettings({ ...settings, heroPrimaryBtnText: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#faf9f7] border border-black/10 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0e0c1d] mb-0.5">Target Link</label>
                      <input
                        type="text"
                        value={settings.heroPrimaryBtnLink || "/products"}
                        onChange={(e) => setSettings({ ...settings, heroPrimaryBtnLink: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#faf9f7] border border-black/10 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-black/10 space-y-2">
                    <span className="block text-[11px] font-bold text-[#5a45ff] uppercase font-mono">
                      Secondary CTA Button
                    </span>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0e0c1d] mb-0.5">Button Label</label>
                      <input
                        type="text"
                        value={settings.heroSecondaryBtnText || "Custom Print"}
                        onChange={(e) => setSettings({ ...settings, heroSecondaryBtnText: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#faf9f7] border border-black/10 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0e0c1d] mb-0.5">Target Link</label>
                      <input
                        type="text"
                        value={settings.heroSecondaryBtnLink || "/contact"}
                        onChange={(e) => setSettings({ ...settings, heroSecondaryBtnLink: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#faf9f7] border border-black/10 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* General Store Settings */}
              <div className="p-5 rounded-2xl bg-[#faf9f7] border border-black/10 space-y-4">
                <h3 className="font-bold text-sm text-[#0e0c1d] font-display">General Store Notices &amp; Contacts</h3>

                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Top Announcement Bar Text</label>
                  <input
                    type="text"
                    value={settings.announcement || ""}
                    onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-black/10 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0e0c1d] mb-1">WhatsApp Phone Number</label>
                    <input
                      type="text"
                      value={settings.whatsapp || ""}
                      onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-black/10 rounded-xl text-xs font-semibold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Delivery Area Notice</label>
                    <input
                      type="text"
                      value={settings.deliveryArea || ""}
                      onChange={(e) => setSettings({ ...settings, deliveryArea: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-black/10 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Mandatory WebP Image Engine & Batch Migration Panel */}
              <div className="p-6 rounded-2xl bg-[#faf9f7] border border-[#5a45ff]/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="font-bold text-sm text-[#0e0c1d] font-display">
                      Mandatory WebP Image Engine &amp; Optimizer
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[10px] font-mono font-bold text-emerald-800">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-[#6a6880] leading-relaxed">
                  All uploaded product, hero, and gallery photos are automatically validated using binary magic bytes, resized within safe dimensions, and converted to optimized WebP format with responsive variants.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleTriggerMigration}
                    disabled={isMigratingImages}
                    className="px-4 py-2 rounded-xl bg-[#5a45ff] hover:bg-[#4330e6] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#c8f542]" />
                    <span>{isMigratingImages ? "Converting Catalog to WebP..." : "Run Batch WebP Migration"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTriggerRollback}
                    disabled={isRollingBackImages}
                    className="px-4 py-2 rounded-xl bg-white border border-black/10 hover:bg-black/5 text-[#6a6880] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>{isRollingBackImages ? "Rolling back..." : "Rollback to Original Assets"}</span>
                  </button>
                </div>

                {migrationStatus && (
                  <div className="p-3 bg-white rounded-xl border border-black/10 text-xs font-mono text-[#0e0c1d] flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{migrationStatus}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn dark text-xs font-bold py-3.5 px-8 flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4 text-[#c8f542]" />
                <span>Publish Hero &amp; Storefront Settings</span>
              </button>
            </form>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
          <div className="max-w-md bg-white border border-black/10 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold font-display text-[#0e0c1d]">Admin Security</h2>
              <p className="text-xs text-[#6a6880]">Update the master admin password.</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0e0c1d] mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn dark text-xs font-bold py-3 px-6 flex items-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Update Password</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* PRODUCT EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="font-bold font-display text-lg text-[#0e0c1d]">
                {editingProduct.id ? `Edit: ${editingProduct.name || "Product"}` : "New Product"}
              </h3>
              <button onClick={() => setEditingProduct(null)} className="p-1 rounded-lg hover:bg-[#faf9f7]">
                <X className="w-5 h-5 text-[#6a6880]" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Category</label>
                  <select
                    value={editingProduct.category_id || "home-decor"}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category_id: e.target.value,
                        category_ids: JSON.stringify([e.target.value]),
                      })
                    }
                    className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Price (e.g. ?299)</label>
                  <input
                    type="text"
                    value={editingProduct.price || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Reference (INR)</label>
                  <input
                    type="number"
                    value={editingProduct.reference_price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, reference_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Floor Price (INR)</label>
                  <input
                    type="number"
                    value={editingProduct.min_offer_floor || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, min_offer_floor: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Main Product Image</label>
                <div className="space-y-2">
                  {editingProduct.image && (
                    <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-black/10 bg-black/5">
                      <img
                        src={editingProduct.image}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, image: "" })}
                        className="absolute top-2 right-2 p-1 rounded-lg bg-red-500 text-white hover:bg-red-600"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isUploadingProductImg}
                      onClick={() => productImgInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-[#5a45ff]/40 hover:border-[#5a45ff] bg-[#faf9f7] hover:bg-[#eeedfb] text-xs font-bold text-[#5a45ff] transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {isUploadingProductImg ? "Uploading…" : editingProduct.image ? "Replace Image" : "Upload Image"}
                    </button>
                    <input
                      ref={productImgInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          uploadImageFile(e.target.files[0], setIsUploadingProductImg, (url) => {
                            setEditingProduct((prev: any) => ({ ...prev, image: url }));
                          }, "Product image");
                        }
                      }}
                    />
                    {editingProduct.image && (
                      <input
                        type="text"
                        value={editingProduct.image}
                        readOnly
                        className="flex-1 px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-[10px] font-mono text-[#6a6880] truncate"
                        title={editingProduct.image}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Short Description</label>
                <textarea
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Material</label>
                  <input
                    type="text"
                    value={editingProduct.material || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#faf9f7] border border-black/10 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={editingProduct.dimensions || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, dimensions: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">3D Model Type</label>
                  <select
                    value={editingProduct.model_3d_type || "cat"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, model_3d_type: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-bold text-[#5a45ff]"
                  >
                    <option value="cat">Cat Figurine</option>
                    <option value="penguin">Penguin</option>
                    <option value="lamp">Shadow Lamp</option>
                    <option value="custom">Parametric Sculpture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Status</label>
                  <select
                    value={editingProduct.active ? "1" : "0"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, active: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-[#faf9f7] border border-black/10 rounded-xl text-xs"
                  >
                    <option value="1">Active (Visible)</option>
                    <option value="0">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-xs font-bold text-[#6a6880]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn dark text-xs font-bold py-2.5 px-6">
                  Save Product to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY EDIT MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold font-display text-base text-[#0e0c1d]">
              {editingCategory.id ? "Edit Category" : "New Category"}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Name</label>
                <input
                  type="text"
                  value={editingCategory.name || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Description</label>
                <input
                  type="text"
                  value={editingCategory.description || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Category Image</label>
                <div className="space-y-2">
                  {editingCategory.image && (
                    <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-black/10 bg-black/5">
                      <img
                        src={editingCategory.image}
                        alt="Category preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <button
                        type="button"
                        onClick={() => setEditingCategory({ ...editingCategory, image: "" })}
                        className="absolute top-2 right-2 p-1 rounded-lg bg-red-500 text-white hover:bg-red-600"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={isUploadingCategoryImg}
                    onClick={() => categoryImgInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-[#5a45ff]/40 hover:border-[#5a45ff] bg-[#faf9f7] hover:bg-[#eeedfb] text-xs font-bold text-[#5a45ff] transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isUploadingCategoryImg ? "Uploading…" : editingCategory.image ? "Replace Image" : "Upload Category Image"}
                  </button>
                  <input
                    ref={categoryImgInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        uploadImageFile(e.target.files[0], setIsUploadingCategoryImg, (url) => {
                          setEditingCategory((prev: any) => ({ ...prev, image: url }));
                        }, "Category image");
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-xs font-bold text-[#6a6880]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn dark text-xs font-bold py-2 px-5">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GALLERY EDIT MODAL */}
      {editingGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold font-display text-base text-[#0e0c1d]">Edit Gallery Image</h3>
            <form onSubmit={handleSaveGallery} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Title</label>
                <input
                  type="text"
                  value={editingGallery.title || ""}
                  onChange={(e) => setEditingGallery({ ...editingGallery, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Tag</label>
                <input
                  type="text"
                  value={editingGallery.tag || ""}
                  onChange={(e) => setEditingGallery({ ...editingGallery, tag: e.target.value })}
                  className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Gallery Image</label>
                <div className="space-y-2">
                  {editingGallery.src && (
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-black/10 bg-black/5">
                      <img
                        src={editingGallery.src}
                        alt="Gallery preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <button
                        type="button"
                        onClick={() => setEditingGallery({ ...editingGallery, src: "" })}
                        className="absolute top-2 right-2 p-1 rounded-lg bg-red-500 text-white hover:bg-red-600"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={isUploadingGalleryImg}
                    onClick={() => galleryImgInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-[#5a45ff]/40 hover:border-[#5a45ff] bg-[#faf9f7] hover:bg-[#eeedfb] text-xs font-bold text-[#5a45ff] transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isUploadingGalleryImg ? "Uploading…" : editingGallery.src ? "Replace Image" : "Upload Gallery Image"}
                  </button>
                  <input
                    ref={galleryImgInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        uploadImageFile(e.target.files[0], setIsUploadingGalleryImg, (url) => {
                          setEditingGallery((prev: any) => ({ ...prev, src: url }));
                        }, "Gallery image");
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setEditingGallery(null)}
                  className="px-4 py-2 text-xs font-bold text-[#6a6880]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn dark text-xs font-bold py-2 px-5">
                  Save Gallery Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ EDIT MODAL */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold font-display text-base text-[#0e0c1d]">Edit FAQ</h3>
            <form onSubmit={handleSaveFaq} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Question</label>
                <input
                  type="text"
                  value={editingFaq.question || ""}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Answer</label>
                <textarea
                  value={editingFaq.answer || ""}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  className="px-4 py-2 text-xs font-bold text-[#6a6880]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn dark text-xs font-bold py-2 px-5">
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMOTION EDIT MODAL */}
      {editingPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-4 shadow-2xl">
            <h3 className="font-bold font-display text-lg text-[#0e0c1d]">
              {editingPromotion.id ? "Configure Promotion" : "Schedule Promotion"}
            </h3>

            <form onSubmit={handleSavePromotion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Target Product</label>
                <select
                  value={editingPromotion.product_id}
                  onChange={(e) =>
                    setEditingPromotion({ ...editingPromotion, product_id: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Ref: ?{p.reference_price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0e0c1d] mb-1">
                  Promotional Title
                </label>
                <input
                  type="text"
                  value={editingPromotion.title || ""}
                  onChange={(e) =>
                    setEditingPromotion({ ...editingPromotion, title: e.target.value })
                  }
                  placeholder="e.g. Weekend Desktop Run"
                  className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">
                    Sale Price (INR)
                  </label>
                  <input
                    type="number"
                    value={editingPromotion.sale_price || 0}
                    onChange={(e) =>
                      setEditingPromotion({ ...editingPromotion, sale_price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold font-mono"
                    required
                  />
                  <span className="text-[10px] text-[#6a6880] mt-0.5 block">
                    Must be &lt; product regular price
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Promo Badge</label>
                  <input
                    type="text"
                    value={editingPromotion.badge || "FLASH SALE"}
                    onChange={(e) =>
                      setEditingPromotion({ ...editingPromotion, badge: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={editingPromotion.start_time ? editingPromotion.start_time.slice(0, 16) : ""}
                    onChange={(e) =>
                      setEditingPromotion({
                        ...editingPromotion,
                        start_time: new Date(e.target.value).toISOString(),
                      })
                    }
                    className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={editingPromotion.end_time ? editingPromotion.end_time.slice(0, 16) : ""}
                    onChange={(e) =>
                      setEditingPromotion({
                        ...editingPromotion,
                        end_time: new Date(e.target.value).toISOString(),
                      })
                    }
                    className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setEditingPromotion(null)}
                  className="px-4 py-2 text-xs font-bold text-[#6a6880]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn dark text-xs font-bold py-2.5 px-6">
                  Save Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION EDIT MODAL */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-4 shadow-2xl">
            <h3 className="font-bold font-display text-lg text-[#0e0c1d]">
              Edit Section: {editingSection.id}
            </h3>

            <form onSubmit={handleSaveSection} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Display Title</label>
                <input
                  type="text"
                  value={editingSection.title || ""}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Subtitle / Note</label>
                <textarea
                  value={editingSection.subtitle || ""}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, subtitle: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editingSection.sort_order || 0}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, sort_order: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Status</label>
                  <select
                    value={editingSection.enabled ? "1" : "0"}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, enabled: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                  >
                    <option value="1">Enabled (Visible on Storefront)</option>
                    <option value="0">Disabled (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 text-xs font-bold text-[#6a6880]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn dark text-xs font-bold py-2.5 px-6">
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* RICH-TEXT PAGE EDITOR & CMS MODAL */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-black/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#eeedfb] text-xs font-mono font-bold text-[#5a45ff]">
                    CMS RICH-TEXT EDITOR
                  </span>
                  <span className="text-xs font-mono text-[#6a6880]">
                    /{editingPage.slug} ? Version {editingPage.version}.0
                  </span>
                </div>
                <h3 className="font-bold font-display text-xl text-[#0e0c1d] mt-1">
                  {editingPage.title || "Untitled Page"}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Mode Selector */}
                <div className="flex items-center bg-[#faf9f7] p-1 rounded-xl border border-black/10 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPageEditorMode("edit")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      pageEditorMode === "edit"
                        ? "bg-[#5a45ff] text-white shadow-xs"
                        : "text-[#6a6880] hover:text-[#0e0c1d]"
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageEditorMode("preview")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      pageEditorMode === "preview"
                        ? "bg-[#5a45ff] text-white shadow-xs"
                        : "text-[#6a6880] hover:text-[#0e0c1d]"
                    }`}
                  >
                    Live Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageEditorMode("history")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      pageEditorMode === "history"
                        ? "bg-[#5a45ff] text-white shadow-xs"
                        : "text-[#6a6880] hover:text-[#0e0c1d]"
                    }`}
                  >
                    History ({pageRevisions.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="p-2 rounded-xl hover:bg-[#faf9f7] text-[#6a6880] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Editor Body */}
            {pageEditorMode === "edit" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Page Title</label>
                    <input
                      type="text"
                      value={editingPage.title || ""}
                      onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#faf9f7] border border-black/10 rounded-xl text-sm font-bold font-display"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Route Slug</label>
                    <input
                      type="text"
                      value={editingPage.slug || ""}
                      onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value.toLowerCase().trim() })}
                      className="w-full px-3.5 py-2.5 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Category</label>
                    <select
                      value={editingPage.category || "Legal & Compliance"}
                      onChange={(e) => setEditingPage({ ...editingPage, category: e.target.value })}
                      className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                    >
                      <option value="Company">Company (About, Contact)</option>
                      <option value="Customer Policies">Customer Policies (Shipping, Returns)</option>
                      <option value="Legal & Compliance">Legal &amp; Compliance (Terms, Privacy)</option>
                      <option value="Commercial & Marketplace">Commercial &amp; Marketplace</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Document Summary / Lead</label>
                    <input
                      type="text"
                      value={editingPage.summary || ""}
                      onChange={(e) => setEditingPage({ ...editingPage, summary: e.target.value })}
                      placeholder="Brief statutory statement or introductory summary"
                      className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Rich-Text Formatting Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-bold">
                  <span className="text-[10px] font-mono text-[#6a6880] mr-1">FORMAT:</span>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<strong>", "</strong>")}
                    className="px-2.5 py-1 rounded-lg bg-white border border-black/10 hover:bg-[#eeedfb]"
                  >
                    Bold
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<em>", "</em>")}
                    className="px-2.5 py-1 rounded-lg bg-white border border-black/10 hover:bg-[#eeedfb]"
                  >
                    Italic
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<h2>", "</h2>")}
                    className="px-2.5 py-1 rounded-lg bg-white border border-black/10 hover:bg-[#eeedfb]"
                  >
                    H2 Heading
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<h3>", "</h3>")}
                    className="px-2.5 py-1 rounded-lg bg-white border border-black/10 hover:bg-[#eeedfb]"
                  >
                    H3 Heading
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<ul>\n  <li>", "</li>\n</ul>")}
                    className="px-2.5 py-1 rounded-lg bg-white border border-black/10 hover:bg-[#eeedfb]"
                  >
                    Bullet List
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('<div class="notice-box">\n  <strong>STATUTORY NOTICE:</strong> ', "\n</div>")}
                    className="px-2.5 py-1 rounded-lg bg-[#eeedfb] text-[#5a45ff] border border-[#5a45ff]/20"
                  >
                    Notice Box
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('<table class="legal-table">\n  <tr><td>Item</td><td>Value</td></tr>\n', "</table>")}
                    className="px-2.5 py-1 rounded-lg bg-white border border-black/10 hover:bg-[#eeedfb]"
                  >
                    Table
                  </button>
                </div>

                {/* Main Content HTML Textarea */}
                <div>
                  <textarea
                    value={editingPage.content_html || ""}
                    onChange={(e) => setEditingPage({ ...editingPage, content_html: e.target.value })}
                    rows={15}
                    className="w-full p-4 bg-[#faf9f7] border border-black/10 rounded-2xl font-mono text-xs text-[#0e0c1d] leading-relaxed focus:outline-none focus:border-[#5a45ff]"
                    placeholder="Enter HTML content..."
                  />
                </div>

                {/* Revision Note input */}
                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">
                    Revision Audit Note (Stored in Version History)
                  </label>
                  <input
                    type="text"
                    value={revisionNote}
                    onChange={(e) => setRevisionNote(e.target.value)}
                    placeholder="e.g. Updated Section 3 for Consumer Protection Rules compliance"
                    className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Live Preview Mode */}
            {pageEditorMode === "preview" && (
              <div className="space-y-4 p-6 bg-[#faf9f7] border border-black/10 rounded-2xl max-h-[60vh] overflow-y-auto">
                <div className="pb-4 border-b border-black/10">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#eeedfb] text-xs font-mono font-bold text-[#5a45ff]">
                    {editingPage.category}
                  </span>
                  <h1 className="text-2xl font-bold font-display text-[#0e0c1d] mt-2">
                    {editingPage.title}
                  </h1>
                  {editingPage.summary && (
                    <p className="text-sm text-[#4b5563] mt-1">{editingPage.summary}</p>
                  )}
                </div>

                <div
                  className="prose-legal text-sm leading-relaxed text-[#374151] space-y-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#0e0c1d] [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[#0e0c1d] [&_ul]:list-disc [&_ul]:pl-5 [&_.notice-box]:p-4 [&_.notice-box]:rounded-xl [&_.notice-box]:bg-[#eeedfb]/60 [&_.notice-box]:border [&_.notice-box]:border-[#5a45ff]/20 [&_.legal-table]:w-full [&_.legal-table_td]:p-2.5 [&_.legal-table_td]:border [&_.legal-table_td]:border-black/10"
                  dangerouslySetInnerHTML={{ __html: editingPage.content_html || "<p>Empty content</p>" }}
                />
              </div>
            )}

            {/* Revision History Mode */}
            {pageEditorMode === "history" && (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-black/10 text-xs">
                  <span className="font-bold text-[#0e0c1d]">Saved Historical Revisions</span>
                  <span className="text-[#6a6880] font-mono">SQLite Persistent Ledger</span>
                </div>

                {pageRevisions.length === 0 ? (
                  <p className="text-xs text-[#6a6880] py-6 text-center">No previous revisions recorded yet.</p>
                ) : (
                  pageRevisions.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-[#faf9f7] border border-black/10 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-mono text-[#5a45ff]">
                            Version {rev.version}.0
                          </strong>
                          <span className="text-xs font-bold text-[#0e0c1d]">{rev.title}</span>
                        </div>
                        <p className="text-xs text-[#6a6880] italic">&ldquo;{rev.note}&rdquo;</p>
                        <span className="text-[10px] font-mono text-[#94a3b8] block">
                          Recorded: {rev.created_at} by {rev.author}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingPage({
                            ...editingPage,
                            title: rev.title,
                            content_html: rev.content_html,
                          });
                          setPageEditorMode("edit");
                          showNotification(`Restored content from Version ${rev.version}.0`);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-[#eeedfb] text-xs font-bold text-[#0e0c1d] transition-colors cursor-pointer"
                      >
                        Restore This Version
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Modal Footer Controls */}
            <div className="pt-4 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs font-bold text-[#0e0c1d] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPage.legal_review_flagged === 1}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        legal_review_flagged: e.target.checked ? 1 : 0,
                      })
                    }
                    className="accent-[#5a45ff] w-4 h-4 rounded"
                  />
                  <span>Flag for Indian Legal Counsel Verification</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 text-xs font-bold text-[#6a6880] hover:text-[#0e0c1d]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleSavePage(0)}
                  className="px-4 py-2.5 rounded-xl border border-black/15 bg-white hover:bg-[#faf9f7] text-xs font-bold text-[#0e0c1d] transition-colors cursor-pointer"
                >
                  Save Draft (Unpublished)
                </button>

                <button
                  type="button"
                  onClick={() => handleSavePage(1)}
                  className="btn dark text-xs font-bold py-2.5 px-6 shadow-md"
                >
                  Publish Page (Live on Storefront)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}