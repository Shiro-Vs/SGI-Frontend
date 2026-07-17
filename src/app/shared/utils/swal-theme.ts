import Swal from 'sweetalert2';

// Instancia de SweetAlert2 con el tema oscuro del SGI, para que los popups
// combinen con el resto de la interfaz en vez de mostrarse en blanco.
export const AppSwal = Swal.mixin({
  background: '#1e293b',
  color: '#f8fafc',
  confirmButtonColor: '#3b82f6',
  cancelButtonColor: '#334155',
  customClass: {
    popup: 'sgi-swal-popup'
  }
});
