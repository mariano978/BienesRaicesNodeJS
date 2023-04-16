(async function () {
  let coord = {
    lat: -31.745892337795638,
    lng: -60.53923534164746,
  };

  const mapa = L.map("mapa-inicio").setView(coord, 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapa);

  //este grupo será una capa por encima del mapa, para poder modificarla mas adelante
  //sin tener que modificar el mapa completo
  const markersGroup = new L.FeatureGroup().addTo(mapa);

  const propiedades = await consultarApiPropiedades();

  mostrarPinesPropiedades(propiedades);

  const categoriasSelect = document.querySelector("#categorias");
  const preciosSelect = document.querySelector("#precios");
  const contenedorControlesFiltro = categoriasSelect.parentNode.parentNode;

  const filtros = {
    categoriaId: "",
    precioId: "",
  };

  categoriasSelect.addEventListener("change", (event) => {
    filtros.categoriaId = +event.target.value;
    filtrarYMostrarPropiedades();
  });

  preciosSelect.addEventListener("change", (event) => {
    filtros.precioId = +event.target.value;
    filtrarYMostrarPropiedades();
  });

  function consultarApiPropiedades() {
    const urlPropiedades = "/api/propiedades";

    return fetch(urlPropiedades)
      .then((respuesta) => {
        return respuesta.json();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function mostrarPinesPropiedades(propiedades) {
    if (propiedades.length === 0) {
      mostrarMensajeNoHayPropiedades();
      return;
    }
    
    eliminarMensajeNoHayPropiedades();

    //creamos una instancia de limites vacia
    const bounds = new L.LatLngBounds();

    markersGroup.clearLayers();

    propiedades.forEach((propiedad, index) => {
      const [lat, lng] = propiedad.coordenadas.split(",");

      const marker = new L.marker([lat, lng], { autoPan: true }).addTo(mapa);

      const textForMarker = `
      <p class="text-green-400 font-bold">${propiedad.categoria.nombre}</p >
      <h3 class="text-lg text-zinc-800 my-0 font-bold px=0 py=0">${propiedad.titulo}</h3>
      <img src="uploads/${propiedad.imagen}", alt="imagen_propiedad" class=" w-full block mb-2 mt-2")/>
      <p class=" text-zinc-500 m-0">${propiedad.precio.nombre}</p >
      <a href="/propiedad/${propiedad.id}" class=" bg-green-400 block text-center text-zinc-800 font-bold rounded px-2 py-1 cursor-pointer">Ver propiedad</a>`;

      markersGroup.addLayer(marker);
      //vamos agregando los limites para crear un area geografica en el mapa
      bounds.extend([lat, lng]);

      if (index === 0) {
        marker.bindPopup(textForMarker).openPopup();
      } else {
        marker.bindPopup(textForMarker);
      }
    });

    //ajusta el zoom a esa area
    mapa.fitBounds(bounds);
  }

  function filtrarYMostrarPropiedades() {
    const propiedadesFiltradas = propiedades.filter((propiedad) => {
      return (
        (!filtros.categoriaId ||
          propiedad.categoria.id === filtros.categoriaId) &&
        (!filtros.precioId || propiedad.precio.id === filtros.precioId)
      );
    });

    mostrarPinesPropiedades(propiedadesFiltradas);
  }

  function mostrarMensajeNoHayPropiedades() {
    eliminarMensajeNoHayPropiedades();
    const elementoMensaje = document.createElement("P");
    elementoMensaje.classList.add(
      "text-red-500",
      "text-md",
      "font-bold",
      "flex-1"
    );
    elementoMensaje.id = "mensajeNoHayResultados";
    elementoMensaje.textContent = "No hay Resultados !";
    contenedorControlesFiltro.appendChild(elementoMensaje);
  }

  function eliminarMensajeNoHayPropiedades() {
    const mensajeAnterior = document.querySelector("#mensajeNoHayResultados");
    if (mensajeAnterior) {
      mensajeAnterior.remove();
    }
    return;
  }
})();