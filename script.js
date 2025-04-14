const productos = [
  {
    id: 1,
    nombre: "Manzana",
    precio: 3.0,
    categoria: "frutas",
    img: "https://via.placeholder.com/150?text=Manzana"
  },
  {
    id: 2,
    nombre: "Zanahoria",
    precio: 2.5,
    categoria: "verduras",
    img: "https://via.placeholder.com/150?text=Zanahoria"
  },
  {
    id: 3,
    nombre: "Almendras",
    precio: 5.0,
    categoria: "snacks",
    img: "https://via.placeholder.com/150?text=Almendras"
  },
  {
    id: 4,
    nombre: "Plátano",
    precio: 2.0,
    categoria: "frutas",
    img: "https://via.placeholder.com/150?text=Platano"
  },
  {
    id: 5,
    nombre: "Espinaca",
    precio: 4.0,
    categoria: "verduras",
    img: "https://via.placeholder.com/150?text=Espinaca"
  },
  {
    id: 6,
    nombre: "Aguacate",
    precio: 3.5,
    categoria: "frutas",
    img: "https://via.placeholder.com/150?text=Aguacate"
  },
  {
    id: 7,
    nombre: "Brócoli",
    precio: 3.8,
    categoria: "verduras",
    img: "https://via.placeholder.com/150?text=Brocoli"
  },
  {
    id: 8,
    nombre: "Granola",
    precio: 4.5,
    categoria: "snacks",
    img: "https://via.placeholder.com/150?text=Granola"
  },
  {
    id: 9,
    nombre: "Fresas",
    precio: 4.0,
    categoria: "frutas",
    img: "https://via.placeholder.com/150?text=Fresas"
  },
  {
    id: 10,
    nombre: "Pepino",
    precio: 2.2,
    categoria: "verduras",
    img: "https://via.placeholder.com/150?text=Pepino"
  },
  {
    id: 11,
    nombre: "Frutos secos variados",
    precio: 6.0,
    categoria: "snacks",
    img: "https://via.placeholder.com/150?text=Frutos+secos"
  },
  {
    id: 12,
    nombre: "Uvas",
    precio: 3.2,
    categoria: "frutas",
    img: "https://via.placeholder.com/150?text=Uvas"
  },
  {
    id: 13,
    nombre: "Tomate",
    precio: 3.0,
    categoria: "verduras",
    img: "https://via.placeholder.com/150?text=Tomate"
  },
  {
    id: 14,
    nombre: "Chía",
    precio: 4.0,
    categoria: "snacks",
    img: "https://via.placeholder.com/150?text=Chia"
  }
];

let carrito = new Map();

const contenedorProductos = document.getElementById("productos");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total");
const cantidadCarrito = document.getElementById("cantidad-carrito");
const contenedorPayPal = document.getElementById("paypal-button-container");

function filtrarPorCategoria() {
  const seleccion = document.getElementById("categoria").value;
  const productosFiltrados =
    seleccion === "todos"
      ? productos
      : productos.filter((p) => p.categoria === seleccion);

  contenedorProductos.innerHTML = "";

  productosFiltrados.forEach((prod) => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <img src="${prod.img}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p>Precio: $${prod.precio.toFixed(2)}</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    `;
    contenedorProductos.appendChild(div);
  });
}

function agregarAlCarrito(id) {
  const producto = productos.find((p) => p.id === id);
  if (!producto) return;

  if (carrito.has(id)) {
    carrito.get(id).cantidad++;
  } else {
    carrito.set(id, { ...producto, cantidad: 1 });
  }

  guardarCarrito();
  actualizarCarrito();
}

function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;
  let cantidadTotal = 0;

  carrito.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.nombre} - $${item.precio.toFixed(2)} x ${item.cantidad}
      <button onclick="eliminarDelCarrito(${item.id})">❌</button>
    `;
    listaCarrito.appendChild(li);
    total += item.precio * item.cantidad;
    cantidadTotal += item.cantidad;
  });

  totalCarrito.textContent = total.toFixed(2);
  cantidadCarrito.textContent = cantidadTotal;
  contenedorPayPal.style.display = carrito.size > 0 ? "block" : "none";
}

function eliminarDelCarrito(id) {
  if (!carrito.has(id)) return;

  let item = carrito.get(id);
  if (item.cantidad > 1) {
    item.cantidad--;
  } else {
    carrito.delete(id);
  }

  guardarCarrito();
  actualizarCarrito();
}

function vaciarCarrito() {
  if (carrito.size === 0) return;

  if (confirm("¿Seguro que quieres vaciar el carrito?")) {
    carrito.clear();
    guardarCarrito();
    actualizarCarrito();
  }
}

function finalizarCompra() {
  if (carrito.size === 0) {
    alert("Tu carrito está vacío. Agrega productos antes de comprar.");
    return;
  }

  alert("¡Gracias por tu compra! 🥗 Tu pedido está en camino.");
  vaciarCarrito();
}

function guardarCarrito() {
  localStorage.setItem(
    "carrito",
    JSON.stringify(Array.from(carrito.entries()))
  );
}

function cargarCarrito() {
  const data = localStorage.getItem("carrito");
  if (data) {
    carrito = new Map(JSON.parse(data));
    actualizarCarrito();
  }
}

// PayPal Smart Button
if (window.paypal) {
  paypal
    .Buttons({
      createOrder: function (data, actions) {
        const total = Array.from(carrito.values()).reduce(
          (acc, item) => acc + item.precio * item.cantidad,
          0
        );
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: total.toFixed(2)
              }
            }
          ]
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          alert(
            `¡Gracias ${details.payer.name.given_name}, tu pago fue exitoso! 🥗`
          );
          vaciarCarrito();
        });
      },
      onError: function (err) {
        console.error("Error con PayPal:", err);
        alert("Hubo un problema con el pago. Intenta de nuevo.");
      }
    })
    .render("#paypal-button-container");
}

// Inicializar
filtrarPorCategoria();
cargarCarrito();
