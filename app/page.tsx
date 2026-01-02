"use client";

import { useState, useEffect } from "react";
import type React from "react";

type ItemStatus = "planned" | "purchased";
type Lang = "de" | "en";
type ItemFilter = "all" | "planned" | "purchased";
type ItemSort = "createdDesc" | "priceAsc" | "nameAsc";

interface Item {
  id: number;
  name: string;
  shopName: string;
  url: string;
  price: number;
  quantity: number;
  status: ItemStatus;
  createdAt?: string;
  note?: string;
}

interface Project {
  id: number;
  name: string;
  budget: number | null;
  currency: string;
  items: Item[];
}

const STORAGE_KEY = "gathercart-projects-v1";
const LANGUAGE_KEY = "gathercart-language-v1";

export default function Home() {
  const [language, setLanguage] = useState<Lang>("de");
  const [itemFilter, setItemFilter] = useState<ItemFilter>("all");
  const [itemSort, setItemSort] = useState<ItemSort>("createdDesc");

  const tr = (de: string, en: string) => (language === "de" ? de : en);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );

  // Projekt-Formular
  const [projectName, setProjectName] = useState("");
  const [projectBudget, setProjectBudget] = useState("");
  const [projectCurrency, setProjectCurrency] = useState("EUR");
  const [projectCurrencyCustom, setProjectCurrencyCustom] = useState("");

  // Item-Formular
  const [itemName, setItemName] = useState("");
  const [itemShop, setItemShop] = useState("");
  const [itemUrl, setItemUrl] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemNote, setItemNote] = useState("");

  // Projekt bearbeiten
  const [editProjectName, setEditProjectName] = useState("");
  const [editBudget, setEditBudget] = useState("");
  const [editCurrency, setEditCurrency] = useState("EUR");
  const [editCurrencyCustom, setEditCurrencyCustom] = useState("");

  // Item bearbeiten
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemShop, setEditItemShop] = useState("");
  const [editItemUrl, setEditItemUrl] = useState("");
  const [editItemPrice, setEditItemPrice] = useState("");
  const [editItemQuantity, setEditItemQuantity] = useState("");
  const [editItemNote, setEditItemNote] = useState("");

  const [copyFeedback, setCopyFeedback] = useState("");

  // Sprache laden
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(LANGUAGE_KEY);
    if (saved === "de" || saved === "en") {
      setLanguage(saved);
    }
  }, []);

  // Sprache speichern
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  // Projekte laden
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved: Project[] = JSON.parse(raw);
        const normalized = saved.map((p) => ({
          ...p,
          currency: p.currency || "EUR",
        }));
        setProjects(normalized);
        if (normalized.length > 0) {
          setSelectedProjectId(normalized[0].id);
        }
      } catch (err) {
        console.error("Konnte gespeicherte Projekte nicht laden:", err);
      }
    }
  }, []);

  // Projekte speichern
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (err) {
      console.error("Konnte Projekte nicht speichern:", err);
    }
  }, [projects]);

  // Edit-Felder syncen bei Projektwechsel
  useEffect(() => {
    const p = projects.find((p) => p.id === selectedProjectId) || null;
    if (p) {
      setEditProjectName(p.name);
      setEditBudget(p.budget != null ? String(p.budget) : "");
      setEditCurrency(p.currency || "EUR");
      setEditCurrencyCustom("");
    } else {
      setEditProjectName("");
      setEditBudget("");
      setEditCurrency("EUR");
      setEditCurrencyCustom("");
    }
    cancelEditItem();
  }, [projects, selectedProjectId]);

  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) || null;

  function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!projectName.trim()) return;

    const finalCurrency =
      projectCurrency === "CUSTOM" && projectCurrencyCustom.trim()
        ? projectCurrencyCustom.trim().toUpperCase()
        : projectCurrency || "EUR";

    const newProject: Project = {
      id: projects.length > 0 ? projects[projects.length - 1].id + 1 : 1,
      name: projectName.trim(),
      budget: projectBudget ? Number(projectBudget) : null,
      currency: finalCurrency,
      items: [],
    };

    setProjects((prev) => [...prev, newProject]);
    setProjectName("");
    setProjectBudget("");
    setProjectCurrency("EUR");
    setProjectCurrencyCustom("");
    setSelectedProjectId(newProject.id);
  }

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProject) return;
    if (!itemName.trim() || !itemShop.trim() || !itemPrice) return;

    const newItem: Item = {
      id:
        selectedProject.items.length > 0
          ? selectedProject.items[selectedProject.items.length - 1].id + 1
          : 1,
      name: itemName.trim(),
      shopName: itemShop.trim(),
      url: itemUrl.trim(),
      price: Number(itemPrice),
      quantity: Number(itemQuantity) || 1,
      status: "planned",
      createdAt: new Date().toISOString(),
      note: itemNote.trim() ? itemNote.trim() : undefined,
    };

    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProject.id
          ? { ...p, items: [...p.items, newItem] }
          : p
      )
    );

    setItemName("");
    setItemShop("");
    setItemUrl("");
    setItemPrice("");
    setItemQuantity("1");
    setItemNote("");
  }

  function toggleItemStatus(projectId: number, itemId: number) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              items: p.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      status:
                        item.status === "planned" ? "purchased" : "planned",
                    }
                  : item
              ),
            }
          : p
      )
    );
  }

  function deleteItem(projectId: number, itemId: number) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              items: p.items.filter((item) => item.id !== itemId),
            }
          : p
      )
    );
    if (editingItemId === itemId) {
      cancelEditItem();
    }
  }

  function deleteProject(projectId: number) {
    setProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== projectId);
      if (filtered.length === 0) {
        setSelectedProjectId(null);
      } else if (selectedProjectId === projectId) {
        setSelectedProjectId(filtered[0].id);
      }
      return filtered;
    });
  }

  function handleUpdateProjectMeta(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProject) return;
    const newBudget = editBudget ? Number(editBudget) : null;

    const finalCurrency =
      editCurrency === "CUSTOM" && editCurrencyCustom.trim()
        ? editCurrencyCustom.trim().toUpperCase()
        : editCurrency || "EUR";

    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProject.id
          ? { ...p, budget: newBudget, currency: finalCurrency }
          : p
      )
    );
  }

  function handleUpdateProjectName(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProject) return;
    if (!editProjectName.trim()) return;

    const newName = editProjectName.trim();

    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProject.id ? { ...p, name: newName } : p
      )
    );
  }

  function startEditItem(item: Item) {
    setEditingItemId(item.id);
    setEditItemName(item.name);
    setEditItemShop(item.shopName);
    setEditItemUrl(item.url);
    setEditItemPrice(String(item.price));
    setEditItemQuantity(String(item.quantity));
    setEditItemNote(item.note ?? "");
  }

  function cancelEditItem() {
    setEditingItemId(null);
    setEditItemName("");
    setEditItemShop("");
    setEditItemUrl("");
    setEditItemPrice("");
    setEditItemQuantity("");
    setEditItemNote("");
  }

  function saveEditedItem(projectId: number, itemId: number) {
    if (!editItemName.trim() || !editItemShop.trim() || !editItemPrice) return;

    const newPrice = Number(editItemPrice);
    const newQuantity = editItemQuantity ? Number(editItemQuantity) : 1;
    const newNote = editItemNote.trim() ? editItemNote.trim() : undefined;

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              items: p.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      name: editItemName.trim(),
                      shopName: editItemShop.trim(),
                      url: editItemUrl.trim(),
                      price: newPrice,
                      quantity: newQuantity,
                      note: newNote,
                    }
                  : item
              ),
            }
          : p
      )
    );
    cancelEditItem();
  }

  function getTotals(project: Project | null) {
    if (!project) return { totalPlanned: 0, totalPurchased: 0 };
    const totalPlanned = project.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalPurchased = project.items
      .filter((i) => i.status === "purchased")
      .reduce((sum, item) => sum + item.price * item.quantity, 0);

    return { totalPlanned, totalPurchased };
  }

  const { totalPlanned, totalPurchased } = getTotals(selectedProject);

  let plannedPercent: number | null = null;
  let purchasedPercent: number | null = null;
  if (selectedProject && selectedProject.budget && selectedProject.budget > 0) {
    plannedPercent = (totalPlanned / selectedProject.budget) * 100;
    purchasedPercent = (totalPurchased / selectedProject.budget) * 100;
  }

  async function handleCopyProjectList() {
    if (!selectedProject) return;

    const lines: string[] = [];
    const currency = selectedProject.currency;

    lines.push(
      (language === "de" ? "Projekt: " : "Project: ") + selectedProject.name
    );

    if (selectedProject.budget != null) {
      const rest = selectedProject.budget - totalPlanned;
      lines.push(
        (language === "de" ? "Budget: " : "Budget: ") +
          `${selectedProject.budget.toFixed(2)} ${currency}`
      );
      lines.push(
        (language === "de" ? "Geplant: " : "Planned: ") +
          `${totalPlanned.toFixed(2)} ${currency}, ` +
          (language === "de"
            ? `Rest: ${rest.toFixed(2)} ${currency}`
            : `left: ${rest.toFixed(2)} ${currency}`)
      );
    } else {
      lines.push(
        (language === "de" ? "Geplant: " : "Planned: ") +
          `${totalPlanned.toFixed(2)} ${currency}`
      );
    }

    lines.push(
      (language === "de"
        ? "Als gekauft markiert: "
        : "Marked as purchased: ") +
        `${totalPurchased.toFixed(2)} ${currency}`
    );
    lines.push("");

    lines.push(language === "de" ? "Produkte:" : "Items:");
    const locale = language === "de" ? "de-DE" : "en-US";

    selectedProject.items.forEach((item) => {
      const check = item.status === "purchased" ? "[x]" : "[ ]";
      const qtyPart = item.quantity !== 1 ? ` x${item.quantity}` : "";
      const timePart = item.createdAt
        ? language === "de"
          ? ` – hinzugefügt: ${new Date(item.createdAt).toLocaleString(
              locale
            )}`
          : ` – added: ${new Date(item.createdAt).toLocaleString(locale)}`
        : "";
      const notePart = item.note
        ? language === "de"
          ? ` – Notiz: ${item.note}`
          : ` – Note: ${item.note}`
        : "";
      lines.push(
        `${check} ${item.name}${qtyPart} – ${item.price.toFixed(2)} ${currency} – ${
          item.shopName
        }${timePart}${notePart}`
      );
      if (item.url) {
        lines.push(`    ${item.url}`);
      }
    });

    const text = lines.join("\n");

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(text);
        setCopyFeedback(
          language === "de" ? "Liste kopiert!" : "List copied to clipboard!"
        );
        setTimeout(() => setCopyFeedback(""), 2000);
      } else {
        window.prompt(
          tr(
            "Text zum Kopieren (Strg+C, Enter zum Schließen):",
            "Text to copy (Ctrl+C, Enter to close):"
          ),
          text
        );
      }
    } catch (err) {
      console.error("Konnte Text nicht in Zwischenablage kopieren:", err);
      window.prompt(
        tr(
          "Text zum Kopieren (Strg+C, Enter zum Schließen):",
          "Text to copy (Ctrl+C, Enter to close):"
        ),
        text
      );
    }
  }

  const locale = language === "de" ? "de-DE" : "en-US";

  // Items nach Filter + Sortierung
  const filteredItems =
    selectedProject?.items
      .filter((item) => {
        if (itemFilter === "all") return true;
        if (itemFilter === "planned") return item.status === "planned";
        if (itemFilter === "purchased") return item.status === "purchased";
        return true;
      })
      .sort((a, b) => {
        if (itemSort === "createdDesc") {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        }
        if (itemSort === "priceAsc") {
          if (a.price === b.price) {
            return a.name.localeCompare(b.name);
          }
          return a.price - b.price;
        }
        if (itemSort === "nameAsc") {
          return a.name.localeCompare(b.name);
        }
        return 0;
      }) ?? [];

  // Quick-Actions Status
  function setAllItemsStatus(status: ItemStatus) {
    if (!selectedProject) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProject.id
          ? { ...p, items: p.items.map((item) => ({ ...item, status })) }
          : p
      )
    );
  }

  // Projekt duplizieren
  function duplicateProject(projectId: number) {
    const original = projects.find((p) => p.id === projectId);
    if (!original) return;

    const newProjectId =
      projects.length > 0 ? projects[projects.length - 1].id + 1 : 1;

    const clonedItems: Item[] = original.items.map((item, index) => ({
      ...item,
      id: index + 1,
    }));

    const newProject: Project = {
      ...original,
      id: newProjectId,
      name:
        language === "de"
          ? `${original.name} (Kopie)`
          : `${original.name} (Copy)`,
      items: clonedItems,
    };

    setProjects((prev) => [...prev, newProject]);
    setSelectedProjectId(newProjectId);
  }

  function handleResetAll() {
    const ok = window.confirm(
      language === "de"
        ? "Wirklich alle Projekte und Daten löschen? Das kann nicht rückgängig gemacht werden."
        : "Really delete all projects and data? This cannot be undone."
    );
    if (!ok) return;

    setProjects([]);
    setSelectedProjectId(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header mit Panther-Lownax-Branding */}
        <header className="border-b border-slate-800 pb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* „Panther“-Logo (neutral gehalten) */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900 border border-emerald-500/60 flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <span className="text-xl sm:text-2xl" aria-hidden="true">
                🐈‍⬛
              </span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex flex-wrap items-center gap-2">
                GatherCart{" "}
                <span className="text-slate-400 text-xs sm:text-sm font-normal">
                  {tr("V1 – lokal", "V1 – local")}
                </span>
              </h1>
              <span className="block text-xs text-slate-400">
                {tr(
                  "Daten bleiben in diesem Browser gespeichert",
                  "Data stays in this browser"
                )}
              </span>
              <span className="block text-[11px] text-slate-500 mt-1">
                {tr("Erstellt von", "Created by")}{" "}
                <span className="font-semibold text-slate-200">Lownax</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1 text-xs">
            <span className="text-slate-400">{tr("Sprache", "Language")}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage("de")}
                className={`px-2 py-1 rounded border text-xs ${
                  language === "de"
                    ? "bg-slate-100 text-slate-900 border-slate-100"
                    : "bg-slate-900 border-slate-700 text-slate-200"
                }`}
              >
                DE
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-2 py-1 rounded border text-xs ${
                  language === "en"
                    ? "bg-slate-100 text-slate-900 border-slate-100"
                    : "bg-slate-900 border-slate-700 text-slate-200"
                }`}
              >
                EN
              </button>
            </div>
            <span className="text-[10px] text-slate-500">
              {tr(
                "EN als internationale Standardsprache",
                "EN as global default language"
              )}
            </span>
          </div>
        </header>

        {/* Kurze Beschreibung */}
        <section className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-sm space-y-2">
          <h2 className="text-base sm:text-lg font-semibold">
            {tr("Was ist GatherCart?", "What is GatherCart?")}
          </h2>
          <p className="text-slate-300">
            {tr(
              "GatherCart hilft dir, Projekte zu planen – ganz egal ob Urlaub, neuer PC-Build, Wohnungseinrichtung oder einfach eine größere Shopping-Liste.",
              "GatherCart helps you plan projects – whether it’s a vacation, new PC build, home setup, or just a bigger shopping list."
            )}
          </p>
          <p className="text-slate-400 text-xs sm:text-sm">
            {tr(
              "Lege Projekte an, erfasse Produkte mit Preis, Shop, Link und Notizen, markiere sie als gekauft und behalte dein Budget im Blick. Alles bleibt lokal in deinem Browser gespeichert.",
              "Create projects, add items with price, shop, link and notes, mark them as purchased and keep an eye on your budget. Everything stays locally in your browser."
            )}
          </p>
        </section>

        {/* Daten-Tools: Export / Import / Reset */}
        <section className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-xs flex flex-wrap gap-3 items-center justify-between">
          <div className="font-semibold text-slate-200">
            {tr("Datenverwaltung", "Data management")}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const data = { version: 1, projects };
                const json = JSON.stringify(data, null, 2);
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "gathercart-data.json";
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700"
            >
              {tr("Exportieren", "Export")}
            </button>
            <label className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer">
              {tr("Importieren", "Import")}
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                      const text = ev.target?.result as string;
                      const parsed = JSON.parse(text);
                      let importedProjects: Project[];

                      if (Array.isArray(parsed)) {
                        importedProjects = parsed;
                      } else if (parsed && Array.isArray(parsed.projects)) {
                        importedProjects = parsed.projects;
                      } else {
                        throw new Error("Ungültiges Format");
                      }

                      const normalized = importedProjects.map((p, pi) => ({
                        ...p,
                        id: p.id ?? pi + 1,
                        currency: p.currency || "EUR",
                        items: (p.items || []).map((item: any, index: number) => ({
                          ...item,
                          id: item.id ?? index + 1,
                        })),
                      }));

                      setProjects(normalized);
                      setSelectedProjectId(normalized[0]?.id ?? null);
                      e.target.value = "";
                      alert(
                        language === "de"
                          ? "Daten erfolgreich importiert."
                          : "Data imported successfully."
                      );
                    } catch (err) {
                      console.error(err);
                      alert(
                        language === "de"
                          ? "Import fehlgeschlagen. Datei ungültig?"
                          : "Import failed. Invalid file?"
                      );
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </label>
            <button
              onClick={handleResetAll}
              className="px-3 py-1 rounded bg-red-700 hover:bg-red-600"
            >
              {tr("Alles löschen", "Delete all")}
            </button>
          </div>
        </section>

        <section className="grid md:grid-cols-[260px,1fr] gap-6">
          {/* Links: Projekte */}
          <div className="space-y-6">
            {/* Neues Projekt */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">
                {tr("Neues Projekt", "New project")}
              </h2>
              <form onSubmit={handleCreateProject} className="space-y-3 text-sm">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-300">
                    {tr("Name", "Name")}
                  </label>
                  <input
                    className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-sm"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder={tr(
                      "z.B. Sommerurlaub 2026",
                      "e.g. Summer vacation 2026"
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-300">
                    {tr("Budget (optional)", "Budget (optional)")}
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        className="flex-1 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-sm"
                        type="number"
                        value={projectBudget}
                        onChange={(e) => setProjectBudget(e.target.value)}
                        placeholder={tr("z.B. 2500", "e.g. 2500")}
                      />
                      <select
                        className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-sm"
                        value={projectCurrency}
                        onChange={(e) => {
                          setProjectCurrency(e.target.value);
                          if (e.target.value !== "CUSTOM") {
                            setProjectCurrencyCustom("");
                          }
                        }}
                      >
                        <option value="EUR">EUR – Euro</option>
                        <option value="USD">USD – US Dollar</option>
                        <option value="THB">THB – Thai Baht</option>
                        <option value="GBP">GBP – British Pound</option>
                        <option value="CHF">CHF – Swiss Franc</option>
                        <option value="JPY">JPY – Japanese Yen</option>
                        <option value="AUD">AUD – Australian Dollar</option>
                        <option value="CAD">CAD – Canadian Dollar</option>
                        <option value="SEK">SEK – Swedish Krona</option>
                        <option value="NOK">NOK – Norwegian Krone</option>
                        <option value="DKK">DKK – Danish Krone</option>
                        <option value="PLN">PLN – Polish Złoty</option>
                        <option value="CZK">CZK – Czech Koruna</option>
                        <option value="TRY">TRY – Turkish Lira</option>
                        <option value="ZAR">ZAR – South African Rand</option>
                        <option value="CUSTOM">
                          {tr(
                            "Andere / eigene Währung",
                            "Other / custom currency"
                          )}
                        </option>
                      </select>
                    </div>
                    {projectCurrency === "CUSTOM" && (
                      <input
                        className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-sm"
                        value={projectCurrencyCustom}
                        onChange={(e) =>
                          setProjectCurrencyCustom(e.target.value)
                        }
                        placeholder={tr(
                          "z.B. MXN, BRL, PHP",
                          "e.g. MXN, BRL, PHP"
                        )}
                        maxLength={5}
                      />
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-sm font-medium py-1.5 rounded"
                >
                  {tr("Projekt anlegen", "Create project")}
                </button>
              </form>
            </div>

            {/* Projektliste */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">
                {tr("Deine Projekte", "Your projects")}
              </h2>
              {projects.length === 0 && (
                <p className="text-sm text-slate-400">
                  {tr("Noch keine Projekte.", "No projects yet.")}
                </p>
              )}
              <ul className="space-y-1 text-sm">
                {projects.map((p) => (
                  <li key={p.id} className="flex gap-1">
                    <button
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`flex-1 text-left px-2 py-1 rounded ${
                        p.id === selectedProjectId
                          ? "bg-emerald-600/80 text-white"
                          : "bg-slate-800 hover:bg-slate-700"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-xs text-slate-300">
                          {tr("Währung", "Currency")}: {p.currency}
                          {p.budget != null &&
                            ` • ${tr("Budget", "Budget")}: ${p.budget.toFixed(
                              2
                            )} ${p.currency}`}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => duplicateProject(p.id)}
                      className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600"
                      title={tr("Projekt duplizieren", "Duplicate project")}
                    >
                      ⧉
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            language === "de"
                              ? `Projekt "${p.name}" wirklich löschen?`
                              : `Really delete project "${p.name}"?`
                          )
                        ) {
                          deleteProject(p.id);
                        }
                      }}
                      className="px-2 py-1 text-xs rounded bg-red-700 hover:bg-red-600"
                      title={tr("Projekt löschen", "Delete project")}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Rechts: Detailansicht */}
          <div className="space-y-6">
            {!selectedProject && (
              <div className="bg-slate-900 border border-dashed border-slate-700 rounded-lg p-6 text-sm text-slate-300">
                {tr(
                  "Wähle links ein Projekt aus oder lege ein neues an.",
                  "Select a project on the left or create a new one."
                )}
              </div>
            )}

            {selectedProject && (
              <>
                {/* Projekt-Header */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold mb-1">
                        {selectedProject.name}
                      </h2>

                      <form
                        onSubmit={handleUpdateProjectName}
                        className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center text-xs mb-3"
                      >
                        <input
                          className="flex-1 px-2 py-1 rounded bg-slate-950 border border-slate-700"
                          value={editProjectName}
                          onChange={(e) => setEditProjectName(e.target.value)}
                          placeholder={tr(
                            "Projektname ändern",
                            "Change project name"
                          )}
                        />
                        <button
                          type="submit"
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
                        >
                          {tr("Namen speichern", "Save name")}
                        </button>
                      </form>

                      <div className="text-sm space-y-1">
                        <p>
                          {tr("Gesamt geplant:", "Total planned:")}{" "}
                          <span className="font-semibold">
                            {totalPlanned.toFixed(2)}{" "}
                            {selectedProject.currency}
                          </span>
                        </p>
                        <p>
                          {tr(
                            'Bereits als „gekauft“ markiert:',
                            'Already marked as "purchased":'
                          )}{" "}
                          <span className="font-semibold">
                            {totalPurchased.toFixed(2)}{" "}
                            {selectedProject.currency}
                          </span>
                        </p>
                        {selectedProject.budget != null && (
                          <>
                            <p>
                              {tr("Budget:", "Budget:")}{" "}
                              <span className="font-semibold">
                                {selectedProject.budget.toFixed(2)}{" "}
                                {selectedProject.currency}
                              </span>{" "}
                              –{" "}
                              {tr("Rest:", "Remaining:")}{" "}
                              <span
                                className={
                                  selectedProject.budget - totalPlanned < 0
                                    ? "font-semibold text-red-400"
                                    : "font-semibold text-emerald-400"
                                }
                              >
                                {(
                                  selectedProject.budget - totalPlanned
                                ).toFixed(2)}{" "}
                                {selectedProject.currency}
                              </span>
                            </p>
                            {plannedPercent != null && (
                              <p className="text-xs text-slate-300">
                                {language === "de"
                                  ? `Verplant: ${plannedPercent.toFixed(
                                      1
                                    )}% des Budgets, davon ${purchasedPercent?.toFixed(
                                      1
                                    )}% bereits als „gekauft“ markiert.`
                                  : `Planned: ${plannedPercent.toFixed(
                                      1
                                    )}% of the budget, of which ${purchasedPercent?.toFixed(
                                      1
                                    )}% already marked as "purchased".`}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Budget & Currency bearbeiten (Desktop) */}
                    <div className="text-xs text-right space-y-1 w-40 hidden sm:block">
                      <form
                        onSubmit={handleUpdateProjectMeta}
                        className="space-y-1"
                      >
                        <label className="block text-slate-300">
                          {tr("Budget", "Budget")}
                          <input
                            className="mt-1 w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs"
                            type="number"
                            value={editBudget}
                            onChange={(e) => setEditBudget(e.target.value)}
                            placeholder={tr(
                              "leer = kein Budget",
                              "empty = no budget"
                            )}
                          />
                        </label>
                        <label className="block text-slate-300">
                          {tr("Währung", "Currency")}
                          <select
                            className="mt-1 w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs"
                            value={editCurrency}
                            onChange={(e) => {
                              setEditCurrency(e.target.value);
                              if (e.target.value !== "CUSTOM") {
                                setEditCurrencyCustom("");
                              }
                            }}
                          >
                            <option value="EUR">EUR – Euro</option>
                            <option value="USD">USD – US Dollar</option>
                            <option value="THB">THB – Thai Baht</option>
                            <option value="GBP">GBP – British Pound</option>
                            <option value="CHF">CHF – Swiss Franc</option>
                            <option value="JPY">JPY – Japanese Yen</option>
                            <option value="AUD">AUD – Australian Dollar</option>
                            <option value="CAD">CAD – Canadian Dollar</option>
                            <option value="SEK">SEK – Swedish Krona</option>
                            <option value="NOK">NOK – Norwegian Krone</option>
                            <option value="DKK">DKK – Danish Krone</option>
                            <option value="PLN">PLN – Polish Złoty</option>
                            <option value="CZK">CZK – Czech Koruna</option>
                            <option value="TRY">TRY – Turkish Lira</option>
                            <option value="ZAR">ZAR – South African Rand</option>
                            <option value="CUSTOM">
                              {tr(
                                "Andere / eigene Währung",
                                "Other / custom currency"
                              )}
                            </option>
                          </select>
                        </label>
                        {editCurrency === "CUSTOM" && (
                          <input
                            className="mt-1 w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs"
                            value={editCurrencyCustom}
                            onChange={(e) =>
                              setEditCurrencyCustom(e.target.value)
                            }
                            placeholder={tr(
                              "z.B. MXN, BRL, PHP",
                              "e.g. MXN, BRL, PHP"
                            )}
                            maxLength={5}
                          />
                        )}
                        <button
                          type="submit"
                          className="w-full bg-slate-800 hover:bg-slate-700 rounded py-1"
                        >
                          {tr("Speichern", "Save")}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Neues Produkt */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    {tr("Neues Produkt hinzufügen", "Add new item")}
                  </h3>
                  <form
                    onSubmit={handleAddItem}
                    className="grid md:grid-cols-2 gap-3 text-sm"
                  >
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-300">
                        {tr("Name", "Name")}
                      </label>
                      <input
                        className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-sm"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder={tr(
                          "z.B. Monitor 27 Zoll",
                          "e.g. 27\" monitor"
                        )}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-300">
                        {tr("Shop / Anbieter", "Shop / Vendor")}
                      </label>
                      <input
                        className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-sm"
                        value={itemShop}
                        onChange={(e) => setItemShop(e.target.value)}
                        placeholder={tr(
                          "z.B. Amazon, MediaMarkt...",
                          "e.g. Amazon, local shop..."
                        )}
                      />
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-slate-300">
                        {tr("URL (optional)", "URL (optional)")}
                      </label>
                      <input
                        className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-sm"
                        value={itemUrl}
                        onChange={(e) => setItemUrl(e.target.value)}
                        placeholder={tr(
                          "Produkt-Link (optional)",
                          "Product link (optional)"
                        )}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-300">
                        {tr("Preis", "Price")} ({selectedProject.currency})
                      </label>
                      <input
                        className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-sm"
                        type="number"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                        placeholder={tr("z.B. 199", "e.g. 199")}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-300">
                        {tr("Menge", "Quantity")}
                      </label>
                      <input
                        className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-sm"
                        type="number"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(e.target.value)}
                        placeholder="1"
                      />
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-slate-300">
                        {tr("Notiz (optional)", "Note (optional)")}
                      </label>
                      <textarea
                        className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-sm resize-y min-h-[48px]"
                        value={itemNote}
                        onChange={(e) => setItemNote(e.target.value)}
                        placeholder={tr(
                          "z.B. Alternative Produktidee, Lieferzeit, Variante...",
                          "e.g. alternative product, delivery time, variant..."
                        )}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-sm font-medium py-1.5 rounded"
                      >
                        {tr("Produkt hinzufügen", "Add item")}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Produktliste */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <h3 className="text-lg font-semibold">
                      {tr("Produkte im Projekt", "Items in project")}
                    </h3>
                    <div className="flex flex-col items-end gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-300">
                          {tr("Filter:", "Filter:")}
                        </span>
                        <button
                          onClick={() => setItemFilter("all")}
                          className={`px-2 py-0.5 rounded border ${
                            itemFilter === "all"
                              ? "bg-slate-100 text-slate-900 border-slate-100"
                              : "bg-slate-900 border-slate-700 text-slate-200"
                          }`}
                        >
                          {tr("Alle", "All")}
                        </button>
                        <button
                          onClick={() => setItemFilter("planned")}
                          className={`px-2 py-0.5 rounded border ${
                            itemFilter === "planned"
                              ? "bg-slate-100 text-slate-900 border-slate-100"
                              : "bg-slate-900 border-slate-700 text-slate-200"
                          }`}
                        >
                          {tr("Offen", "Planned")}
                        </button>
                        <button
                          onClick={() => setItemFilter("purchased")}
                          className={`px-2 py-0.5 rounded border ${
                            itemFilter === "purchased"
                              ? "bg-slate-100 text-slate-900 border-slate-100"
                              : "bg-slate-900 border-slate-700 text-slate-200"
                          }`}
                        >
                          {tr("Gekauft", "Purchased")}
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-300">
                          {tr("Sortierung:", "Sort:")}
                        </span>
                        <button
                          onClick={() => setItemSort("createdDesc")}
                          className={`px-2 py-0.5 rounded border ${
                            itemSort === "createdDesc"
                              ? "bg-slate-100 text-slate-900 border-slate-100"
                              : "bg-slate-900 border-slate-700 text-slate-200"
                          }`}
                        >
                          {tr("Neueste zuerst", "Newest first")}
                        </button>
                        <button
                          onClick={() => setItemSort("priceAsc")}
                          className={`px-2 py-0.5 rounded border ${
                            itemSort === "priceAsc"
                              ? "bg-slate-100 text-slate-900 border-slate-100"
                              : "bg-slate-900 border-slate-700 text-slate-200"
                          }`}
                        >
                          {tr("Preis ↑", "Price ↑")}
                        </button>
                        <button
                          onClick={() => setItemSort("nameAsc")}
                          className={`px-2 py-0.5 rounded border ${
                            itemSort === "nameAsc"
                              ? "bg-slate-100 text-slate-900 border-slate-100"
                              : "bg-slate-900 border-slate-700 text-slate-200"
                          }`}
                        >
                          {tr("Name A–Z", "Name A–Z")}
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-300">
                          {tr("Status-Aktionen:", "Status actions:")}
                        </span>
                        <button
                          onClick={() => setAllItemsStatus("planned")}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
                        >
                          {tr("Alle offen", "All planned")}
                        </button>
                        <button
                          onClick={() => setAllItemsStatus("purchased")}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
                        >
                          {tr("Alle gekauft", "All purchased")}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedProject.items.length > 0 && (
                          <button
                            onClick={handleCopyProjectList}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
                          >
                            {tr("Liste kopieren", "Copy list")}
                          </button>
                        )}
                        {copyFeedback && (
                          <span className="text-emerald-400">
                            {copyFeedback}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedProject.items.length === 0 && (
                    <p className="text-sm text-slate-400">
                      {tr(
                        "Noch keine Produkte hinzugefügt.",
                        "No items added yet."
                      )}
                    </p>
                  )}

                  {selectedProject.items.length > 0 &&
                    filteredItems.length === 0 && (
                      <p className="text-sm text-slate-400">
                        {tr(
                          "Keine Produkte für diesen Filter.",
                          "No items for this filter."
                        )}
                      </p>
                    )}

                  {filteredItems.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-1 pr-2">✓</th>
                            <th className="text-left py-1 pr-2">
                              {tr("Name", "Name")}
                            </th>
                            <th className="text-left py-1 pr-2">
                              {tr("Shop", "Shop")}
                            </th>
                            <th className="text-left py-1 pr-2">
                              {tr("Preis", "Price")}
                            </th>
                            <th className="text-left py-1 pr-2">
                              {tr("Menge", "Qty")}
                            </th>
                            <th className="text-left py-1 pr-2">
                              {tr("Notiz", "Note")}
                            </th>
                            <th className="text-left py-1 pr-2">
                              {tr("Hinzugefügt", "Added")}
                            </th>
                            <th className="text-left py-1 pr-2">Link</th>
                            <th className="text-left py-1 pr-2">
                              {tr("Aktion", "Action")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredItems.map((item) => {
                            const isEditing = editingItemId === item.id;
                            const createdText = item.createdAt
                              ? new Date(
                                  item.createdAt
                                ).toLocaleString(locale)
                              : "-";
                            return (
                              <tr
                                key={item.id}
                                className="border-b border-slate-800"
                              >
                                <td className="py-1 pr-2">
                                  <input
                                    type="checkbox"
                                    checked={item.status === "purchased"}
                                    onChange={() =>
                                      toggleItemStatus(
                                        selectedProject.id,
                                        item.id
                                      )
                                    }
                                  />
                                </td>
                                <td className="py-1 pr-2 align-top">
                                  {isEditing ? (
                                    <input
                                      className="w-full px-1 py-0.5 rounded bg-slate-950 border border-slate-700 text-xs"
                                      value={editItemName}
                                      onChange={(e) =>
                                        setEditItemName(e.target.value)
                                      }
                                    />
                                  ) : (
                                    <>
                                      {item.name}
                                      {item.status === "purchased" && (
                                        <span className="ml-2 text-xs text-emerald-400">
                                          {tr("(gekauft)", "(purchased)")}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </td>
                                <td className="py-1 pr-2 align-top">
                                  {isEditing ? (
                                    <input
                                      className="w-full px-1 py-0.5 rounded bg-slate-950 border border-slate-700 text-xs"
                                      value={editItemShop}
                                      onChange={(e) =>
                                        setEditItemShop(e.target.value)
                                      }
                                    />
                                  ) : (
                                    item.shopName
                                  )}
                                </td>
                                <td className="py-1 pr-2 align-top">
                                  {isEditing ? (
                                    <input
                                      className="w-full px-1 py-0.5 rounded bg-slate-950 border border-slate-700 text-xs"
                                      type="number"
                                      value={editItemPrice}
                                      onChange={(e) =>
                                        setEditItemPrice(e.target.value)
                                      }
                                    />
                                  ) : (
                                    <>
                                      {item.price.toFixed(2)}{" "}
                                      {selectedProject.currency}
                                    </>
                                  )}
                                </td>
                                <td className="py-1 pr-2 align-top">
                                  {isEditing ? (
                                    <input
                                      className="w-full px-1 py-0.5 rounded bg-slate-950 border border-slate-700 text-xs"
                                      type="number"
                                      value={editItemQuantity}
                                      onChange={(e) =>
                                        setEditItemQuantity(e.target.value)
                                      }
                                    />
                                  ) : (
                                    item.quantity
                                  )}
                                </td>
                                <td className="py-1 pr-2 align-top">
                                  {isEditing ? (
                                    <textarea
                                      className="w-full px-1 py-0.5 rounded bg-slate-950 border border-slate-700 text-xs resize-y min-h-[40px]"
                                      value={editItemNote}
                                      onChange={(e) =>
                                        setEditItemNote(e.target.value)
                                      }
                                    />
                                  ) : item.note ? (
                                    <span className="whitespace-pre-line">
                                      {item.note}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">-</span>
                                  )}
                                </td>
                                <td className="py-1 pr-2 whitespace-nowrap align-top">
                                  {createdText}
                                </td>
                                <td className="py-1 pr-2 align-top">
                                  {isEditing ? (
                                    <input
                                      className="w-full px-1 py-0.5 rounded bg-slate-950 border border-slate-700 text-xs"
                                      value={editItemUrl}
                                      onChange={(e) =>
                                        setEditItemUrl(e.target.value)
                                      }
                                      placeholder={tr("optional", "optional")}
                                    />
                                  ) : item.url ? (
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-emerald-400 underline"
                                    >
                                      {tr("öffnen", "open")}
                                    </a>
                                  ) : (
                                    <span className="text-slate-500">-</span>
                                  )}
                                </td>
                                <td className="py-1 pr-2 align-top">
                                  {isEditing ? (
                                    <div className="flex flex-col gap-1">
                                      <button
                                        onClick={() =>
                                          saveEditedItem(
                                            selectedProject.id,
                                            item.id
                                          )
                                        }
                                        className="px-2 py-0.5 text-xs rounded bg-emerald-700 hover:bg-emerald-600"
                                      >
                                        {tr("Speichern", "Save")}
                                      </button>
                                      <button
                                        onClick={cancelEditItem}
                                        className="px-2 py-0.5 text-xs rounded bg-slate-700 hover:bg-slate-600"
                                      >
                                        {tr("Abbrechen", "Cancel")}
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-1">
                                      <button
                                        onClick={() => startEditItem(item)}
                                        className="px-2 py-0.5 text-xs rounded bg-slate-700 hover:bg-slate-600"
                                      >
                                        {tr("Bearbeiten", "Edit")}
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (
                                            window.confirm(
                                              language === "de"
                                                ? `Produkt "${item.name}" löschen?`
                                                : `Delete item "${item.name}"?`
                                            )
                                          ) {
                                            deleteItem(
                                              selectedProject.id,
                                              item.id
                                            );
                                          }
                                        }}
                                        className="px-2 py-0.5 text-xs rounded bg-red-700 hover:bg-red-600"
                                      >
                                        {tr("Löschen", "Delete")}
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Footer / Signatur */}
        <footer className="mt-4 border-t border-slate-800 pt-3 text-[11px] text-slate-500 text-center">
          GatherCart · {tr("Konzept & Umsetzung", "Concept & implementation")}{" "}
          <span className="font-semibold text-slate-300">Lownax</span>
        </footer>
      </div>
    </main>
  );
}
