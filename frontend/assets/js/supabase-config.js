// Función para recuperar contraseña - MEJORADA Y CORREGIDA
async function resetPassword(email, options = {}) {
    try {
        console.log('🔐 Enviando correo de recuperación para:', email);
        
        // Validar email
        if (!email || !email.includes('@')) {
            const error = 'Por favor ingresa un correo electrónico válido';
            return { success: false, error };
        }
        
        // Configuración por defecto para el reset - CORREGIDA PARA VERCEL
        // Detectar si estamos en Vercel o desarrollo local
        const isVercel = window.location.hostname.includes('vercel.app');
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        let redirectUrl;
        if (isVercel) {
            // En Vercel, usar la ruta completa
            redirectUrl = `${window.location.origin}/frontend/views/reset_password_page.html`;
        } else if (isLocalhost) {
            // En desarrollo local, detectar la estructura
            const currentPath = window.location.pathname;
            if (currentPath.includes('/views/')) {
                redirectUrl = `${window.location.origin}/views/reset_password_page.html`;
            } else {
                redirectUrl = `${window.location.origin}/frontend/views/reset_password_page.html`;
            }
        } else {
            // Fallback por defecto
            redirectUrl = `${window.location.origin}/frontend/views/reset_password_page.html`;
        }
        
        const resetOptions = {
            redirectTo: options.redirectTo || redirectUrl,
            ...options
        };
        
        console.log('📧 Opciones de reset:', resetOptions);
        console.log('🌐 Entorno detectado:', { isVercel, isLocalhost, redirectUrl });
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, resetOptions);
        
        if (error) {
            console.error('❌ Error al enviar correo de recuperación:', error.message);
            
            // Interpretar diferentes tipos de errores
            let userFriendlyError = error.message;
            
            if (error.message.includes('User not found')) {
                userFriendlyError = 'No encontramos una cuenta asociada a este correo electrónico';
            } else if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
                userFriendlyError = 'Has enviado demasiadas solicitudes. Por favor espera unos minutos e intenta de nuevo';
            } else if (error.message.includes('Email not confirmed')) {
                userFriendlyError = 'Tu cuenta no ha sido confirmada. Por favor revisa tu correo para confirmar tu cuenta primero';
            } else {
                userFriendlyError = 'Error al enviar el correo de recuperación. Por favor intenta de nuevo';
            }
            
            return { success: false, error: userFriendlyError };
        }
        
        console.log('✅ Correo de recuperación enviado exitosamente');
        return { 
            success: true, 
            message: 'Correo de recuperación enviado exitosamente',
            email,
            redirectUrl // Para debugging
        };
        
    } catch (err) {
        console.error('❌ Error inesperado al enviar correo de recuperación:', err);
        return { success: false, error: 'Error inesperado al enviar el correo de recuperación' };
    }
}