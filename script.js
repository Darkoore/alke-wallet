// Carga de saldo disponible
if (!localStorage.getItem('balance')) {
localStorage.setItem('balance', '30000');
}
function updateBalance() {
    const balance = parseFloat(localStorage.getItem('balance')) || 0;
    document.getElementById('balance').textContent = '$' + balance.toLocaleString('es-CL');
}
// Función para guardar transacción en localStorage
function saveTransaction(transaction) {
    const storedTransactions = localStorage.getItem('transactions');
    const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
}
// Función para enviar dinero
function sendMoney(amount) {
    const balance = parseFloat(localStorage.getItem('balance')) || 0;
    if (amount <= 0) {
    alert('El monto debe ser mayor a 0');
    return false;
    }
    if (amount > balance) {
    alert('Saldo insuficiente. Tu saldo actual es: $' + balance.toLocaleString('es-CL'));
    return false;
    }
    // Obtener contacto seleccionado
    const selectedContact = $('.contact-item.active');
    if (selectedContact.length === 0) {
    alert('Por favor, selecciona un contacto');
    return false;
    }
    const recipientName = selectedContact.data('name');
    const recipientCBU = selectedContact.data('cbu');
    const recipientAlias = selectedContact.data('alias');
    const recipientBanco = selectedContact.data('banco');
    // Restar el monto del balance
    const newBalance = balance - amount;
    localStorage.setItem('balance', newBalance.toString());
    // Crear registro de transacción
    const transaction = {
    id: Date.now(),
    tipo: 'Envío',
    monto: amount,
    destinatario: recipientName,
    cbu: recipientCBU,
    alias: recipientAlias,
    banco: recipientBanco,
    fecha: new Date().toISOString(),
    fechaFormateada: new Date().toLocaleString('es-CL')
    };
    // Guardar transacción
    saveTransaction(transaction);
    // Actualizar balance en la UI
    updateBalance();
    return true;
}
updateBalance();
//validacion regex CBU
$('#contactCBU').on('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
});
// Función para cargar contactos desde localStorage
function loadContacts() {
    const storedContacts = localStorage.getItem('contacts');
    const contacts = storedContacts ? JSON.parse(storedContacts) : [];
    $('#contactList').empty();
    contacts.forEach((contact, index) => {
    const contactItem = `
        <li class="list-group-item contact-item" data-index="${index}" data-name="${contact.name}" data-cbu="${contact.cbu}" data-alias="${contact.alias}" data-banco="${contact.banco}">
        <div class="contact-info">
            <span class="contact-name">${contact.name}</span>
            <span class="contact-details">CBU: ${contact.cbu}, Alias: ${contact.alias}, Banco: ${contact.banco}</span>
        </div>
        <button class="btn-delete-contact" data-index="${index}" title="Eliminar contacto">X</button>
        </li>
    `;
    $('#contactList').append(contactItem);
    });
    // Agregar evento de click a los botones de eliminar
    $('.btn-delete-contact').click(function() {
    const index = $(this).data('index');
    deleteContact(index);
    });
}
// Función validacion CBU
function cbuExists(cbu) {
    const storedContacts = localStorage.getItem('contacts');
    const contacts = storedContacts ? JSON.parse(storedContacts) : [];
    return contacts.some(contact => contact.cbu === cbu);
}
// Función para guardar contacto en localStorage
function saveContact(contact) {
    const storedContacts = localStorage.getItem('contacts');
    const contacts = storedContacts ? JSON.parse(storedContacts) : [];
    contacts.push(contact);
    localStorage.setItem('contacts', JSON.stringify(contacts));
    loadContacts();
}
// Función para eliminar contacto
function deleteContact(index) {
    if (confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
    const storedContacts = localStorage.getItem('contacts');
    const contacts = storedContacts ? JSON.parse(storedContacts) : [];
    // Eliminar el contacto del array
    contacts.splice(index, 1);       
    // Guardar el array actualizado en localStorage
    localStorage.setItem('contacts', JSON.stringify(contacts)); 
    // Recargar la lista
    loadContacts();
    }
}
// Cargar contactos al iniciar la página
$(document).ready(function() {
    loadContacts();
});
// Abrir modal para agregar contacto
$('#btnAddContact').click(function() {
    $('#contactForm')[0].reset();
    $('#contactModal').modal('show');
});
// Guardar nuevo contacto
$('#btnSaveContact').click(function() {
    const name = $('#contactName').val().trim();
    const cbu = $('#contactCBU').val().trim();
    const alias = $('#contactAlias').val().trim();
    const banco = $('#contactBanco').val().trim();
    if (name && cbu && alias && banco) {
    // Verificar si el CBU ya existe
    if (cbuExists(cbu)) {
        alert('Este CBU ya está registrado. Por favor, verifica el número.');
        return;
    }
    // Crear objeto contacto
    const newContact = {
        name: name,
        cbu: cbu,
        alias: alias,
        banco: banco
    };
    // Guardar en localStorage
    saveContact(newContact);
    // Cerrar modal y limpiar formulario
    $('#contactModal').modal('hide');
    $('#contactForm')[0].reset();
    } else {
    alert('Por favor, completa todos los campos');
    }
});
// Funcionalidad de búsqueda - Pendiente añadir autocompletado
$('#searchContact').on('keyup', function() {
    const searchText = $(this).val().toLowerCase();
    $('.contact-item').each(function() {
    const contactName = $(this).data('name').toLowerCase();
    const contactAlias = $(this).data('alias').toLowerCase();
    if (contactName.includes(searchText) || contactAlias.includes(searchText)) {
        $(this).show();
    } else {
        $(this).hide();
    }
    });
});
// Formato de dinero al input de sendmoney
const depositInput = document.getElementById('depositAmount');
depositInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
      if (value) {
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      }
    e.target.value = value;
});
// Añadir seleccion
$(document).on('click', '.contact-item', function() {
    $('.contact-item').removeClass('active');
    $(this).addClass('active');
    const name = $(this).data('name');
    console.log('Contacto seleccionado:', name);
});
// Manejar envío del formulario de depósito
$('#btnSendMoney').click(function() {
    const amountText = $('#depositAmount').val().replace(/\./g, ''); // Eliminar puntos
    const amount = parseFloat(amountText);
    if (!amount || isNaN(amount)) {
    alert('Por favor, ingresa un monto válido');
    return;
    }
    if (sendMoney(amount)) {
    alert('Transferencia realizada con éxito!');
    $('#depositAmount').val('');
    $('.contact-item').removeClass('active');
    }
});

// ---------------------------------------------------------------------Scripts de Deposit.HTML----------------------------------------------------------------------------
const depositForm = document.getElementById('depositForm');
const depositAmount = document.getElementById('depositAmount');
const successAlert = document.getElementById('successAlert');
const closeAlert = document.getElementById('closeAlert');    
    // Manejar envío del formulario
depositForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (amount && amount > 0) {
    // Obtener saldo actual
    const currentBalanceValue = parseFloat(localStorage.getItem('balance')) || 0;
    // Sumar depósito
    const newBalance = currentBalanceValue + amount;
    // Guardar nuevo saldo
    localStorage.setItem('balance', newBalance.toString());
    // Mostrar alerta
    successAlert.style.display = 'block';
    successAlert.classList.add('fade', 'show');
    // Limpiar formulario
    depositAmount.value = '';
    // Ocultar alerta después de 3 segundos
    setTimeout(function() {
        successAlert.classList.remove('show');
        setTimeout(function() {
        successAlert.style.display = 'none';
        successAlert.classList.remove('fade');
        }, 150);
    }, 3000);
    }
});

// Manejar cierre manual de la alerta
closeAlert.addEventListener('click', function() {
    successAlert.classList.remove('show');
    setTimeout(function() {
    successAlert.style.display = 'none';
    successAlert.classList.remove('fade');
    }, 150);
});
