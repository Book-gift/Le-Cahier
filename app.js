const $ = id => document.getElementById(id);
let public_ = Object.keys(CATALOGUE)[0];
let niveau = null;
let panier = [];

$("an").textContent = new Date().getFullYear();

// Barre du panier en bas de page
const barre = document.createElement("div");
barre.className = "panier-barre";
barre.hidden = true;
document.body.appendChild(barre);

const cle = s => `${s.niv}|${s.matiere}|${s.annee}`;
const dansPanier = s => panier.some(p => cle(p) === cle(s));
const libelle = s => `${s.examen} ${s.annee} – ${s.matiere} (${s.niv})`;

function majBarre() {
  if (!panier.length) { barre.hidden = true; return; }
  barre.hidden = false;
  barre.innerHTML = `<span>🛒 <strong>${panier.length}</strong> sujet(s) · <strong>${panier.length * PRIX} FCFA</strong></span>`;
  const b = document.createElement("button");
  b.className = "btn small";
  b.type = "button";
  b.textContent = "Voir le panier / Payer";
  b.onclick = () => ouvrirPaiement(panier, true);
  barre.appendChild(b);
}

function ajouterPanier(s) {
  if (!dansPanier(s)) panier.push(s);
  majBarre();
  renderMatieres();
}

function codeCommande() {
  return "CAH-" + Math.floor(1000 + Math.random() * 9000);
}

function lienWhatsApp(items, code, total) {
  const liste = items.map(s => "- " + libelle(s)).join("\n");
  const msg = `Bonjour, j'ai payé ${total} FCFA (code ${code}) pour :\n${liste}\nVoici ma capture.`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

function ouvrirPaiement(items, depuisPanier) {
  const ancien = document.getElementById("paiement");
  if (ancien) ancien.remove();
  if (!items.length) return;
  const code = codeCommande();
  const total = items.length * PRIX;
  const moyens = PAIEMENTS.map(p => `<li><span>${p.nom}</span><strong>${p.numero}</strong></li>`).join("");
  const d = document.createElement("dialog");
  d.id = "paiement";
  d.innerHTML = `
    <h3>Ta commande</h3>
    <ul class="lignes" id="lignes"></ul>
    <p>Total : <strong>${total} FCFA</strong></p>
    <p>Ton code de commande : <strong>${code}</strong></p>
    <p>1. Envoie <strong>${total} FCFA</strong> avec l'un de ces moyens :</p>
    <ul>${moyens}</ul>
    <p>2. Envoie la capture du paiement sur WhatsApp.</p>
    <p>3. Tu reçois tes sujets et leurs corrections.</p>
    <a class="btn" id="wa" target="_blank" rel="noopener" href="${lienWhatsApp(items, code, total)}">J'ai payé, envoyer la capture</a>
    <button class="fermer" type="button">Fermer</button>`;

  const lignes = d.querySelector("#lignes");
  items.forEach(s => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${libelle(s)}</span>`;
    if (depuisPanier) {
      const r = document.createElement("button");
      r.className = "btn small clair";
      r.type = "button";
      r.textContent = "Retirer";
      r.onclick = () => {
        panier = panier.filter(p => cle(p) !== cle(s));
        majBarre();
        renderMatieres();
        if (panier.length) ouvrirPaiement(panier, true);
        else d.close();
      };
      li.appendChild(r);
    }
    lignes.appendChild(li);
  });

  d.querySelector("#wa").onclick = () => {
    if (depuisPanier) {
      panier = [];
      majBarre();
      renderMatieres();
    }
  };
  d.querySelector(".fermer").onclick = () => d.close();
  document.body.appendChild(d);
  d.showModal();
}

function renderPublics() {
  $("publics").innerHTML = "";
  Object.keys(CATALOGUE).forEach(p => {
    const b = document.createElement("button");
    b.textContent = p;
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", p === public_);
    b.onclick = () => { public_ = p; niveau = null; render(); };
    $("publics").appendChild(b);
  });
}

function renderNiveaux() {
  const niveaux = Object.keys(CATALOGUE[public_]);
  if (!niveau) niveau = niveaux[0];
  $("niveaux").innerHTML = "";
  niveaux.forEach(n => {
    const b = document.createElement("button");
    b.textContent = n;
    b.className = "chip";
    b.setAttribute("aria-pressed", n === niveau);
    b.onclick = () => { niveau = n; render(); };
    $("niveaux").appendChild(b);
  });
}

function renderMatieres() {
  const { examen, matieres } = CATALOGUE[public_][niveau];
  const box = $("matieres");
  box.innerHTML = "";
  Object.entries(matieres).forEach(([nom, annees]) => {
    const bloc = document.createElement("div");
    bloc.className = "matiere";
    bloc.innerHTML = `<h3>${nom}</h3>`;
    const liste = document.createElement("ul");
    annees.forEach(a => {
      const s = { niv: niveau, matiere: nom, annee: a, examen };
      const li = document.createElement("li");
      li.innerHTML = `<span>${examen} ${a}<small>sujet + correction</small></span>`;

      const actions = document.createElement("div");
      actions.className = "actions";

      const payer = document.createElement("button");
      payer.className = "btn small";
      payer.type = "button";
      payer.textContent = `Payer · ${PRIX} FCFA`;
      payer.onclick = () => ouvrirPaiement([s], false);

      const ajout = document.createElement("button");
      ajout.className = "btn small clair";
      ajout.type = "button";
      if (dansPanier(s)) {
        ajout.textContent = "Dans le panier ✓";
        ajout.disabled = true;
      } else {
        ajout.textContent = "Ajouter au panier";
        ajout.onclick = () => ajouterPanier(s);
      }

      actions.appendChild(payer);
      actions.appendChild(ajout);
      li.appendChild(actions);
      liste.appendChild(li);
    });
    bloc.appendChild(liste);
    box.appendChild(bloc);
  });
}

function render() {
  renderPublics();
  renderNiveaux();
  renderMatieres();
}
render();