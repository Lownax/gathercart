// lib/db.js
// Einfache In-Memory-"Datenbank" nur für lokale Tests.

let projects = [];
let items = [];
let projectIdCounter = 1;
let itemIdCounter = 1;

function getProjects() {
  return projects;
}

function getProject(id) {
  return projects.find((p) => p.id === id);
}

function createProject(data) {
  const now = new Date().toISOString();
  const project = {
    id: projectIdCounter++,
    name: data.name,
    description: data.description || "",
    projectType: data.projectType || "general",
    budget: data.budget != null ? Number(data.budget) : null,
    currency: data.currency || "EUR",
    createdAt: now,
    updatedAt: now,
  };
  projects.push(project);
  return project;
}

function getItemsForProject(projectId) {
  return items.filter((i) => i.projectId === projectId);
}

function createItem(projectId, data) {
  const item = {
    id: itemIdCounter++,
    projectId,
    name: data.name,
    shopName: data.shopName,
    originalUrl: data.originalUrl,
    pricePlanned: Number(data.pricePlanned),
    currency: data.currency || "EUR",
    status: "planned", // oder "purchased"
    quantity: data.quantity != null ? Number(data.quantity) : 1,
    notes: data.notes || "",
    purchasedPrice: null,
    purchasedAt: null,
  };
  items.push(item);
  return item;
}

function updateItem(id, data) {
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return undefined;
  items[index] = { ...items[index], ...data };
  return items[index];
}

module.exports = {
  getProjects,
  getProject,
  createProject,
  getItemsForProject,
  createItem,
  updateItem,
};
