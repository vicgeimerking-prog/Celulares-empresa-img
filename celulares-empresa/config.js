// ===== CONFIGURACIÓN (lo único que necesitas editar) =====
const CONFIG = {
  nombreEmpresa: "Venta de Celulares",
  eslogan: "Equipos nuevos, garantía real y los mejores precios.",

  // WhatsApp con lada de país, sin espacios ni "+". Ej: 5215512345678
  whatsapp: "5215500000000",

  // Link de la Google Sheet publicada como CSV
  // (Archivo > Compartir > Publicar en la Web > CSV).
  // Vacío = se muestran celulares de ejemplo.
  sheetCSV: "",

  // Foto de fondo del inicio (opcional). Ej: "img/hero.jpg"
  imagenHero: "",

  moneda: "MXN",

  horario: "Lunes a sábado, 10:00 a 19:00",
  direccion: "Ciudad de México",

  metodosPago: ["Efectivo", "Transferencia", "Tarjeta de débito", "Tarjeta de crédito", "Meses sin intereses"],

  entregas: ["Entrega en tienda", "Envío a domicilio", "Punto de encuentro"],

  // Términos y condiciones: revísalos con la empresa antes de publicar
  terminos: [
    { titulo: "Garantía", texto: "Todos los equipos nuevos cuentan con garantía de 12 meses contra defectos de fábrica. No cubre daños por golpes, humedad o mal uso." },
    { titulo: "Apartados", texto: "Puedes apartar tu equipo con un anticipo. El apartado se respeta por 7 días naturales; después de ese plazo el equipo vuelve a estar disponible." },
    { titulo: "Cambios y devoluciones", texto: "Se aceptan cambios dentro de los primeros 7 días, con el equipo en perfecto estado, caja y accesorios completos, y presentando el comprobante de compra." },
    { titulo: "Precios y disponibilidad", texto: "Los precios pueden cambiar sin previo aviso y están sujetos a disponibilidad. Confirma existencia por WhatsApp antes de tu visita." },
    { titulo: "Envíos", texto: "Los envíos se realizan una vez confirmado el pago. El tiempo de entrega depende de la zona; te compartimos el número de guía para darle seguimiento." },
  ],
};
