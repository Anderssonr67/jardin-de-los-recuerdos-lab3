import "./styles.css";
import initSqlJs, { type Database } from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";

type Memory = {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  feeling: string;
  created_at: string;
};

const DB_KEY = "garden-of-memories-db";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <header class="topbar">
    <button class="brand" id="brandButton" aria-label="Ir al inicio">
      <span class="brand-mark">🌿</span>
      <span><strong>JARDÍN</strong><small>DE LOS RECUERDOS</small></span>
    </button>
    <nav>
      <button class="nav-button active" data-view="garden">Mi jardín</button>
      <button class="nav-button" data-view="about">Acerca de</button>
    </nav>
  </header>

  <main>
    <section id="gardenView" class="garden-view">
      <div class="hero">
        <div class="hero-copy-block">
          <p class="eyebrow">Tu historia, día a día</p>
          <h1>Un lugar para<br />lo que <em>nunca se marchita.</em></h1>
          <p class="hero-copy">Hay instantes que merecen echar raíces. Aquí, cada historia se convierte en una flor que siempre vuelve a abrirse.</p>
          <button class="add-button" id="openAddButton">
            <span>✿</span> Plantar un recuerdo
          </button>
        </div>
        <div class="night-garden" aria-label="Ilustración de un jardín nocturno de flores rojas">
          <div class="garden-caption"><span>HERBARIO NOCTURNO</span><span>✳ 01 — ∞</span></div>
          <span class="night-star star-one">✦</span><span class="night-star star-two">✧</span>
          <span class="night-star star-three">·</span><span class="night-star star-four">✧</span>
          <div class="moon"></div>
          <svg class="garden-illustration" viewBox="0 0 520 340" role="img" aria-label="Flores rojas creciendo bajo la luna">
            <path class="hill hill-back" d="M0 255 Q92 199 180 245 T355 224 T520 242 V340 H0Z" />
            <path class="hill hill-front" d="M0 286 Q112 240 226 282 T420 264 T520 280 V340 H0Z" />
            <path class="stem stem-one" d="M154 311 Q147 244 163 184 Q173 147 166 121" />
            <path class="stem stem-two" d="M264 320 Q247 255 269 191 Q288 138 280 87" />
            <path class="stem stem-three" d="M373 310 Q388 255 365 216 Q350 187 362 157" />
            <path class="leaf leaf-one" d="M157 242 Q108 208 102 239 Q119 263 158 250Z" />
            <path class="leaf leaf-two" d="M265 251 Q312 211 326 236 Q311 263 266 260Z" />
            <path class="leaf leaf-three" d="M370 260 Q414 227 428 252 Q413 278 369 270Z" />
            <path class="leaf leaf-four" d="M164 213 Q204 186 213 204 Q198 227 163 221Z" />
            <g class="rose rose-one" transform="translate(166 107)">
              <ellipse rx="12" ry="25" cy="-17" /><ellipse rx="12" ry="25" cy="-17" transform="rotate(60)" />
              <ellipse rx="12" ry="25" cy="-17" transform="rotate(120)" /><circle r="10" />
            </g>
            <g class="rose rose-two" transform="translate(280 73)">
              <ellipse rx="15" ry="31" cy="-21" /><ellipse rx="15" ry="31" cy="-21" transform="rotate(60)" />
              <ellipse rx="15" ry="31" cy="-21" transform="rotate(120)" /><circle r="12" />
            </g>
            <g class="rose rose-three" transform="translate(362 143)">
              <ellipse rx="11" ry="22" cy="-15" /><ellipse rx="11" ry="22" cy="-15" transform="rotate(60)" />
              <ellipse rx="11" ry="22" cy="-15" transform="rotate(120)" /><circle r="9" />
            </g>
            <circle class="firefly" cx="222" cy="151" r="2" /><circle class="firefly firefly-two" cx="421" cy="177" r="2" />
            <circle class="firefly firefly-three" cx="116" cy="157" r="1.5" />
          </svg>
          <div class="garden-note"><span>✦</span> Cultiva lo que te hace florecer</div>
        </div>
      </div>

      <div class="collection-heading">
        <div><p class="eyebrow">Tu colección viva</p><h2>Flores de la memoria</h2></div>
        <span class="collection-note">Cada flor guarda un instante distinto <span>↘</span></span>
      </div>
      <div class="toolbar">
        <label class="search-box">
          <span aria-hidden="true">⌕</span>
          <input id="searchInput" type="search" placeholder="Buscar recuerdos..." />
        </label>
        <select id="categoryFilter" aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>
          <option value="Familia">Familia</option>
          <option value="Amistad">Amistad</option>
          <option value="Viajes">Viajes</option>
          <option value="Logros">Logros</option>
          <option value="Naturaleza">Naturaleza</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      <div class="stats" id="stats"></div>
      <div class="memory-grid" id="memoryGrid"></div>
    </section>

    <section id="aboutView" class="about-view" hidden>
      <p class="eyebrow">Nuestra filosofía</p>
      <h1>Honrar lo vivido, <em>florecer cada día.</em></h1>
      <p>El Jardín de los Recuerdos es un espacio íntimo para conservar historias, emociones y momentos que dieron forma a tu vida.</p>
      <button class="add-button" id="backToGarden">Volver al jardín</button>
    </section>
  </main>

  <dialog id="memoryDialog">
    <form id="memoryForm">
      <div class="dialog-head">
        <div>
          <p class="eyebrow">Nueva entrada</p>
          <h2 id="dialogTitle">Plantar un recuerdo</h2>
        </div>
        <button type="button" class="icon-button" id="closeDialog" aria-label="Cerrar">×</button>
      </div>
      <input type="hidden" id="memoryId" />
      <label>Título
        <input id="titleInput" maxlength="80" required placeholder="Ej. Atardecer en la playa" />
      </label>
      <label>¿Qué recuerdas?
        <textarea id="descriptionInput" maxlength="500" required rows="5" placeholder="Describe este momento con detalle..."></textarea>
      </label>
      <div class="form-row">
        <label>Categoría
          <select id="categoryInput" required>
            <option value="Familia">Familia</option>
            <option value="Amistad">Amistad</option>
            <option value="Viajes">Viajes</option>
            <option value="Logros">Logros</option>
            <option value="Naturaleza">Naturaleza</option>
            <option value="Otro">Otro</option>
          </select>
        </label>
        <label>Fecha
          <input id="dateInput" type="date" required />
        </label>
      </div>
      <fieldset>
        <legend>¿Cómo te sentiste?</legend>
        <div class="feelings" id="feelings">
          ${["Feliz", "Nostálgico", "Agradecido", "Tranquilo", "Inspirado"].map((feeling, index) =>
            `<label><input type="radio" name="feeling" value="${feeling}" ${index === 0 ? "checked" : ""}><span>${feeling}</span></label>`
          ).join("")}
        </div>
      </fieldset>
      <div class="dialog-actions">
        <button type="button" class="secondary-button" id="cancelDialog">Cancelar</button>
        <button type="submit" class="save-button">Guardar recuerdo</button>
      </div>
    </form>
  </dialog>

  <div class="toast" id="toast" role="status"></div>
`;

let db: Database;
let memories: Memory[] = [];

const memoryDialog = document.querySelector<HTMLDialogElement>("#memoryDialog")!;
const memoryForm = document.querySelector<HTMLFormElement>("#memoryForm")!;
const memoryGrid = document.querySelector<HTMLDivElement>("#memoryGrid")!;
const searchInput = document.querySelector<HTMLInputElement>("#searchInput")!;
const categoryFilter = document.querySelector<HTMLSelectElement>("#categoryFilter")!;
const toast = document.querySelector<HTMLDivElement>("#toast")!;

const categoryIcons: Record<string, string> = {
  Familia: "🏡",
  Amistad: "🌻",
  Viajes: "🧭",
  Logros: "🌟",
  Naturaleza: "🍃",
  Otro: "🌸",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric" })
    .format(new Date(`${value}T12:00:00`));

async function initializeDatabase() {
  const SQL = await initSqlJs({
    locateFile: () => sqlWasmUrl,
  });
  const saved = localStorage.getItem(DB_KEY);
  db = saved ? new SQL.Database(Uint8Array.from(atob(saved), (char) => char.charCodeAt(0))) : new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      feeling TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  persistDatabase();

  const seed = db.exec("SELECT COUNT(*) AS count FROM memories")[0]?.values[0]?.[0] as number;
  if (!seed) seedSampleMemories();
  loadMemories();
}

function persistDatabase() {
  if (!db) return;
  const bytes = db.export();
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  localStorage.setItem(DB_KEY, btoa(binary));
}

function seedSampleMemories() {
  const samples = [
    ["Mi primera montaña", "La sensación de llegar a la cima y ver todo el valle bajo mis pies.", "Viajes", "2024-05-18", "Inspirado"],
    ["Cena familiar", "Reímos toda la noche mientras mamá contaba sus historias de juventud.", "Familia", "2025-01-12", "Feliz"],
    ["El proyecto terminado", "Después de mucho esfuerzo, vi mi idea convertirse en realidad.", "Logros", "2025-03-08", "Agradecido"],
  ];
  samples.forEach(([title, description, category, date, feeling]) => {
    db.run(
      "INSERT INTO memories (title, description, category, date, feeling, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [title, description, category, date, feeling, new Date().toISOString()],
    );
  });
  persistDatabase();
}

function loadMemories() {
  const result = db.exec("SELECT id, title, description, category, date, feeling, created_at FROM memories ORDER BY date DESC");
  memories = result.length ? result[0].values.map((row) => ({
    id: Number(row[0]),
    title: String(row[1]),
    description: String(row[2]),
    category: String(row[3]),
    date: String(row[4]),
    feeling: String(row[5]),
    created_at: String(row[6]),
  })) : [];
  render();
}

function getVisibleMemories() {
  const search = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  return memories.filter((memory) =>
    (!category || memory.category === category) &&
    (!search || `${memory.title} ${memory.description}`.toLowerCase().includes(search))
  );
}

function render() {
  const visible = getVisibleMemories();
  const stats = document.querySelector<HTMLDivElement>("#stats")!;
  const categoryCount = new Set(memories.map((memory) => memory.category)).size;
  stats.innerHTML = `
    <div><strong>${memories.length}</strong><span>recuerdos guardados</span></div>
    <div><strong>${categoryCount}</strong><span>categorías floreciendo</span></div>
  `;

  if (!visible.length) {
    memoryGrid.innerHTML = `
      <div class="empty-state">
        <span>🌱</span>
        <h2>No hay recuerdos aquí todavía</h2>
        <p>Plantá el primer recuerdo de esta sección.</p>
      </div>`;
    return;
  }

  memoryGrid.innerHTML = visible.map((memory, index) => `
    <article class="memory-card tone-${memory.category.toLowerCase()}" style="--delay: ${index * 80}ms">
      <div class="memory-art">
        <span class="art-label">RECUERDO Nº ${String(memory.id).padStart(2, "0")}</span>
        <span class="art-symbol">${categoryIcons[memory.category] ?? "🌸"}</span>
        <div class="flower-art" aria-hidden="true">
          <i class="petal petal-1"></i><i class="petal petal-2"></i><i class="petal petal-3"></i><i class="petal petal-4"></i>
          <i class="petal petal-5"></i><i class="petal petal-6"></i><i class="petal petal-7"></i><i class="petal petal-8"></i>
          <i class="flower-center"></i><i class="flower-stem"></i><i class="flower-leaf leaf-a"></i><i class="flower-leaf leaf-b"></i>
        </div>
        <span class="art-date">${formatDate(memory.date)}</span>
      </div>
      <div class="memory-content">
        <div class="card-top">
          <span class="category-label">${memory.category}</span>
          <div class="card-actions">
            <button class="icon-button small" data-action="edit" data-id="${memory.id}" aria-label="Editar">✎</button>
            <button class="icon-button small" data-action="delete" data-id="${memory.id}" aria-label="Eliminar">×</button>
          </div>
        </div>
        <h2>${escapeHtml(memory.title)}</h2>
        <p>${escapeHtml(memory.description)}</p>
        <footer>
          <span class="memory-date">⟡ &nbsp;${formatDate(memory.date)}</span>
          <span class="feeling">${memory.feeling}</span>
        </footer>
      </div>
    </article>
  `).join("");
}

function escapeHtml(value: string) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function openDialog(memory?: Memory) {
  memoryForm.reset();
  document.querySelector<HTMLInputElement>('input[name="feeling"][value="Feliz"]')!.checked = true;
  document.querySelector<HTMLInputElement>("#memoryId")!.value = memory?.id.toString() ?? "";
  document.querySelector("#dialogTitle")!.textContent = memory ? "Editar recuerdo" : "Plantar un recuerdo";
  document.querySelector<HTMLInputElement>("#titleInput")!.value = memory?.title ?? "";
  document.querySelector<HTMLTextAreaElement>("#descriptionInput")!.value = memory?.description ?? "";
  document.querySelector<HTMLSelectElement>("#categoryInput")!.value = memory?.category ?? "Familia";
  document.querySelector<HTMLInputElement>("#dateInput")!.value = memory?.date ?? new Date().toISOString().slice(0, 10);
  if (memory) {
    const feeling = document.querySelector<HTMLInputElement>(`input[name="feeling"][value="${memory.feeling}"]`);
    if (feeling) feeling.checked = true;
  }
  memoryDialog.showModal();
  document.querySelector<HTMLInputElement>("#titleInput")!.focus();
}

function closeDialog() {
  memoryDialog.close();
}

function showToast(message: string) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2400);
}

memoryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const id = document.querySelector<HTMLInputElement>("#memoryId")!.value;
  const title = document.querySelector<HTMLInputElement>("#titleInput")!.value.trim();
  const description = document.querySelector<HTMLTextAreaElement>("#descriptionInput")!.value.trim();
  const category = document.querySelector<HTMLSelectElement>("#categoryInput")!.value;
  const date = document.querySelector<HTMLInputElement>("#dateInput")!.value;
  const feeling = document.querySelector<HTMLInputElement>('input[name="feeling"]:checked')!.value;

  if (id) {
    db.run(
      "UPDATE memories SET title = ?, description = ?, category = ?, date = ?, feeling = ? WHERE id = ?",
      [title, description, category, date, feeling, Number(id)],
    );
    showToast("Recuerdo actualizado");
  } else {
    db.run(
      "INSERT INTO memories (title, description, category, date, feeling, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [title, description, category, date, feeling, new Date().toISOString()],
    );
    showToast("Recuerdo plantado");
  }

  persistDatabase();
  closeDialog();
  loadMemories();
});

memoryGrid.addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  const memory = memories.find((item) => item.id === id);
  if (!memory) return;

  if (button.dataset.action === "edit") {
    openDialog(memory);
  } else if (button.dataset.action === "delete") {
    if (window.confirm(`¿Eliminar el recuerdo "${memory.title}"?`)) {
      db.run("DELETE FROM memories WHERE id = ?", [id]);
      persistDatabase();
      loadMemories();
      showToast("Recuerdo eliminado");
    }
  }
});

document.querySelector("#openAddButton")!.addEventListener("click", () => openDialog());
document.querySelector("#closeDialog")!.addEventListener("click", closeDialog);
document.querySelector("#cancelDialog")!.addEventListener("click", closeDialog);
searchInput.addEventListener("input", render);
categoryFilter.addEventListener("change", render);

document.querySelectorAll<HTMLButtonElement>("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const isAbout = button.dataset.view === "about";
    document.querySelector<HTMLElement>("#gardenView")!.hidden = isAbout;
    document.querySelector<HTMLElement>("#aboutView")!.hidden = !isAbout;
  });
});

document.querySelector("#brandButton")!.addEventListener("click", () => {
  document.querySelectorAll(".nav-button").forEach((item) => item.classList.toggle("active", item.getAttribute("data-view") === "garden"));
  document.querySelector<HTMLElement>("#gardenView")!.hidden = false;
  document.querySelector<HTMLElement>("#aboutView")!.hidden = true;
});
document.querySelector("#backToGarden")!.addEventListener("click", () => {
  document.querySelector<HTMLButtonElement>('[data-view="garden"]')!.click();
});

initializeDatabase().catch((error) => {
  console.error(error);
  memoryGrid.innerHTML = `<div class="empty-state"><h2>No se pudo iniciar la base de datos</h2><p>Recarga la página e inténtalo nuevamente.</p></div>`;
});
