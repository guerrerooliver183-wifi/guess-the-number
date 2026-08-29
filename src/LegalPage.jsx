const legalContent = {
  es: {
    terms: {
      title: "Términos y condiciones",
      intro: "Estas condiciones regulan el uso de Neon Guesser, un juego web gratuito de entretenimiento.",
      sections: [
        ["Uso permitido", "Puedes usar Neon Guesser para fines personales, educativos y de entretenimiento. No debes intentar interrumpir el servicio, manipular sus resultados ni utilizarlo para actividades ilegales."],
        ["Disponibilidad", "El servicio se ofrece tal como está y puede cambiar, suspenderse o dejar de estar disponible sin previo aviso. No garantizamos que funcione sin interrupciones en todos los dispositivos o navegadores."],
        ["Resultados del juego", "Las puntuaciones e historiales se generan localmente en tu navegador. No constituyen premios, competiciones oficiales ni compromisos de rendimiento."],
        ["Propiedad intelectual", "Neon Guesser, su código, diseño, textos y activos están sujetos a la licencia indicada en el archivo LICENSE del repositorio. La licencia aplicable puede cambiar según sus propios términos."],
        ["Contacto y jurisdicción", "Completa el nombre del titular, correo de contacto y jurisdicción aplicable antes de usar esta página como documento legal definitivo."],
      ],
    },
    privacy: {
      title: "Política de privacidad",
      intro: "Neon Guesser está diseñado para funcionar sin cuentas y sin enviar el historial de partidas a un servidor propio.",
      sections: [
        ["Datos que se guardan", "El historial de partidas y la mejor puntuación se guardan en el almacenamiento local de tu navegador. Puedes borrarlos desde el botón de historial o desde la configuración del navegador."],
        ["Datos que no solicitamos", "La aplicación no solicita nombre, correo electrónico, contraseña, ubicación ni información financiera. No se creó un sistema propio de cuentas o perfiles."],
        ["Servicios de terceros", "La interfaz puede cargar las fuentes Orbitron y Space Mono desde Google Fonts. Ese proveedor puede recibir datos técnicos de la solicitud según sus propias políticas."],
        ["Seguridad y conservación", "El almacenamiento local depende del navegador y del dispositivo. No guardes información sensible en el historial. La eliminación de datos puede ocurrir al limpiar el almacenamiento del sitio."],
        ["Derechos y contacto", "Si incorporas analítica, formularios, cuentas o un backend, actualiza esta política con el responsable, finalidades, base legal, plazos de conservación y mecanismo de contacto correspondientes."],
      ],
    },
    cookies: {
      title: "Política de cookies",
      intro: "La versión actual de Neon Guesser no utiliza cookies propias para guardar el historial del juego.",
      sections: [
        ["Almacenamiento local", "El historial utiliza localStorage, que es almacenamiento del navegador y no una cookie. Se usa únicamente para conservar tus partidas en este dispositivo."],
        ["Cookies técnicas", "El proveedor de alojamiento, GitHub Pages, o servicios externos cargados por el navegador podrían establecer recursos o identificadores técnicos sujetos a sus propias políticas."],
        ["Fuentes externas", "La carga de fuentes desde Google Fonts puede generar solicitudes a un tercero. Puedes sustituirlas por archivos locales si necesitas una política sin solicitudes externas."],
        ["Cómo gestionar el almacenamiento", "Puedes borrar el historial desde la aplicación o eliminar los datos del sitio desde la configuración del navegador. Bloquear almacenamiento puede impedir que el historial persista, pero el juego seguirá siendo utilizable."],
      ],
    },
  },
  en: {
    terms: {
      title: "Terms and conditions",
      intro: "These terms govern the use of Neon Guesser, a free web game for entertainment.",
      sections: [
        ["Permitted use", "You may use Neon Guesser for personal, educational, and entertainment purposes. Do not disrupt the service, manipulate its results, or use it for unlawful activity."],
        ["Availability", "The service is provided as-is and may change, be suspended, or become unavailable without notice. We do not guarantee uninterrupted operation on every device or browser."],
        ["Game results", "Scores and game history are generated locally in your browser. They do not represent prizes, official competitions, or performance commitments."],
        ["Intellectual property", "Neon Guesser, its code, design, text, and assets are subject to the license shown in the repository LICENSE file. The applicable license may change according to its own terms."],
        ["Contact and governing law", "Complete the owner name, contact email, and applicable jurisdiction before relying on this page as a final legal document."],
      ],
    },
    privacy: {
      title: "Privacy policy",
      intro: "Neon Guesser is designed to work without accounts and without sending game history to a first-party server.",
      sections: [
        ["Data stored", "Game history and best scores are stored in your browser's local storage. You can delete them using the history button or your browser settings."],
        ["Data we do not request", "The app does not request your name, email, password, location, or financial information. It has no first-party account or profile system."],
        ["Third-party services", "The interface may load Orbitron and Space Mono fonts from Google Fonts. That provider may receive technical request data under its own policies."],
        ["Security and retention", "Local storage depends on your browser and device. Do not store sensitive information in the game history. Clearing site storage can remove these records."],
        ["Rights and contact", "If you add analytics, forms, accounts, or a backend, update this policy with the controller, purposes, legal basis, retention periods, and contact mechanism."],
      ],
    },
    cookies: {
      title: "Cookie policy",
      intro: "The current version of Neon Guesser does not use first-party cookies to save game history.",
      sections: [
        ["Local storage", "Game history uses localStorage, which is browser storage rather than a cookie. It is used only to keep your games on this device."],
        ["Technical cookies", "The hosting provider, GitHub Pages, or resources loaded by the browser may set technical identifiers subject to their own policies."],
        ["External fonts", "Loading fonts from Google Fonts may create requests to a third party. You can self-host the fonts if you need a policy without external font requests."],
        ["Managing storage", "You can clear history from the app or delete site data in your browser settings. Blocking storage may prevent history from persisting, but the game remains usable."],
      ],
    },
  },
};

export default function LegalPage({ type, language, onBack }) {
  const content = legalContent[language][type] ?? legalContent[language].privacy;
  const links = language === "es"
    ? { terms: "Términos", privacy: "Privacidad", cookies: "Cookies" }
    : { terms: "Terms", privacy: "Privacy", cookies: "Cookies" };

  return (
    <div className="app-shell legal-shell">
      <header className="topbar">
        <button type="button" className="brand-lockup brand-button" onClick={onBack} aria-label={language === "es" ? "Volver al juego" : "Back to game"}>
          <span className="brand-mini-mark">?</span>
          <span>NEON GUESSER</span>
        </button>
        <button type="button" className="language-switch" onClick={() => window.dispatchEvent(new CustomEvent("neon-guesser:toggle-language"))}>
          <span>{language.toUpperCase()}</span><span className="language-dot" aria-hidden="true">/</span><span>{language === "es" ? "EN" : "ES"}</span>
        </button>
      </header>

      <main className="legal-container">
        <article className="legal-card">
          <p className="panel-kicker">02 // POLICY</p>
          <h1>{content.title}</h1>
          <p className="legal-intro">{content.intro}</p>
          <p className="legal-date">{language === "es" ? "Borrador informativo · Revisa antes de publicar" : "Informational draft · Review before publishing"}</p>
          <div className="legal-sections">
            {content.sections.map(([heading, paragraph]) => (
              <section key={heading}>
                <h2>{heading}</h2>
                <p>{paragraph}</p>
              </section>
            ))}
          </div>
        </article>

        <nav className="legal-nav" aria-label={language === "es" ? "Documentos legales" : "Legal documents"}>
          {Object.entries(links).map(([key, label]) => (
            <a key={key} className={key === type ? "active" : ""} href={`#/${key}`}>{label}</a>
          ))}
          <button type="button" onClick={onBack}>{language === "es" ? "Volver al juego" : "Back to game"}</button>
        </nav>
      </main>

      <footer><span>NEON GUESSER</span><span aria-hidden="true">•</span><span>{language === "es" ? "DOCUMENTOS LEGALES" : "LEGAL DOCUMENTS"}</span></footer>
    </div>
  );
}
