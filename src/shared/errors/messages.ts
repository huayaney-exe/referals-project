/**
 * Spanish error messages catalog
 * Professional, user-friendly messages without technical jargon
 */

export const ErrorMessages = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'Credenciales inválidas. Por favor verifica tu correo y contraseña.',
  AUTH_TOKEN_EXPIRED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
  AUTH_TOKEN_INVALID: 'Token de autenticación inválido. Por favor inicia sesión nuevamente.',
  AUTH_UNAUTHORIZED: 'No tienes autorización para realizar esta acción.',
  AUTH_MISSING_TOKEN: 'Se requiere autenticación para acceder a este recurso.',
  AUTH_SIGNUP_FAILED: 'No se pudo crear la cuenta. Por favor intenta nuevamente.',

  // Validation errors
  VALIDATION_REQUIRED_FIELD: 'El campo {field} es obligatorio.',
  VALIDATION_INVALID_EMAIL: 'El formato del correo electrónico no es válido.',
  VALIDATION_INVALID_PHONE: 'El número de teléfono debe tener formato peruano (+51 9XX XXX XXX).',
  VALIDATION_INVALID_UUID: 'El identificador proporcionado no es válido.',
  VALIDATION_MIN_LENGTH: 'El campo {field} debe tener al menos {min} caracteres.',
  VALIDATION_MAX_LENGTH: 'El campo {field} no debe exceder {max} caracteres.',
  VALIDATION_INVALID_FORMAT: 'El formato de {field} no es válido.',
  VALIDATION_INVALID_RANGE: 'El valor debe estar entre {min} y {max}.',

  // Business errors
  BUSINESS_NOT_FOUND: 'No se encontró el negocio solicitado.',
  BUSINESS_ALREADY_EXISTS: 'Ya existe un negocio con ese nombre.',
  BUSINESS_UNAUTHORIZED: 'No tienes permisos para administrar este negocio.',
  BUSINESS_INACTIVE: 'El negocio no está activo actualmente.',

  // Customer errors
  CUSTOMER_NOT_FOUND: 'No se encontró el cliente solicitado.',
  CUSTOMER_ALREADY_EXISTS: 'El cliente ya está registrado en este negocio.',
  CUSTOMER_INVALID_PHONE: 'El número de teléfono del cliente no es válido.',
  CUSTOMER_DUPLICATE_PHONE: 'Ya existe un cliente con ese número de teléfono.',

  // Enrollment errors
  ENROLLMENT_NOT_FOUND: 'No se encontró la inscripción solicitada.',
  ENROLLMENT_ALREADY_EXISTS: 'El cliente ya está inscrito en este programa.',
  ENROLLMENT_INACTIVE: 'La inscripción no está activa.',
  ENROLLMENT_EXPIRED: 'La inscripción ha expirado.',

  // Stamp errors
  STAMP_CREATION_FAILED: 'No se pudo registrar el sello. Por favor intenta nuevamente.',
  STAMP_DUPLICATE: 'Este sello ya fue registrado anteriormente.',
  STAMP_INVALID_ENROLLMENT: 'La inscripción no es válida para registrar sellos.',
  STAMP_LIMIT_REACHED: 'Se alcanzó el límite de sellos para este período.',
  STAMP_REWARD_CLAIMED: 'La recompensa ya fue canjeada.',

  // Campaign errors
  CAMPAIGN_NOT_FOUND: 'No se encontró la campaña solicitada.',
  CAMPAIGN_INVALID_STATUS: 'El estado de la campaña no permite esta operación.',
  CAMPAIGN_INVALID_SCHEDULE: 'La fecha de programación debe ser futura.',
  CAMPAIGN_DELETE_NOT_ALLOWED: 'Solo se pueden eliminar campañas en estado borrador.',
  CAMPAIGN_SEND_FAILED: 'No se pudo enviar la campaña. Por favor intenta nuevamente.',

  // WhatsApp/Evolution API errors
  WHATSAPP_SEND_FAILED: 'No se pudo enviar el mensaje de WhatsApp.',
  WHATSAPP_INSTANCE_OFFLINE: 'La instancia de WhatsApp no está disponible.',
  WHATSAPP_INVALID_NUMBER: 'El número de WhatsApp no es válido.',
  WHATSAPP_RATE_LIMIT: 'Se excedió el límite de mensajes. Por favor intenta más tarde.',

  // PassKit errors
  PASSKIT_GENERATION_FAILED: 'No se pudo generar el pase de Apple Wallet.',
  PASSKIT_UPDATE_FAILED: 'No se pudo actualizar el pase de Apple Wallet.',
  PASSKIT_CERTIFICATE_ERROR: 'Error con los certificados de Apple Wallet.',
  PASSKIT_INVALID_DATA: 'Los datos del pase no son válidos.',

  // Storage errors
  STORAGE_UPLOAD_FAILED: 'No se pudo cargar el archivo. Por favor intenta nuevamente.',
  STORAGE_FILE_TOO_LARGE: 'El archivo excede el tamaño máximo permitido de {maxSize}MB.',
  STORAGE_INVALID_TYPE: 'Tipo de archivo no permitido. Formatos válidos: {types}.',
  STORAGE_FILE_NOT_FOUND: 'No se encontró el archivo solicitado.',
  STORAGE_DELETE_FAILED: 'No se pudo eliminar el archivo.',

  // Outbox/Queue errors
  OUTBOX_PROCESSING_FAILED: 'No se pudo procesar el evento. Se reintentará automáticamente.',
  QUEUE_CONNECTION_ERROR: 'Error de conexión con el sistema de colas.',
  QUEUE_JOB_FAILED: 'La tarea falló después de múltiples intentos.',

  // Analytics errors
  ANALYTICS_DATA_UNAVAILABLE: 'Los datos de análisis no están disponibles en este momento.',
  ANALYTICS_INVALID_PERIOD: 'El período de análisis no es válido.',

  // Rate limiting errors
  RATE_LIMIT_EXCEEDED: 'Has excedido el límite de solicitudes. Por favor espera {seconds} segundos.',
  RATE_LIMIT_AUTH_EXCEEDED: 'Demasiados intentos de inicio de sesión. Por favor intenta en {minutes} minutos.',

  // System errors
  INTERNAL_ERROR: 'Ocurrió un error interno. Por favor intenta nuevamente o contacta soporte.',
  DATABASE_ERROR: 'Error de base de datos. Por favor intenta nuevamente.',
  NETWORK_ERROR: 'Error de conexión. Por favor verifica tu conexión a internet.',
  SERVICE_UNAVAILABLE: 'El servicio no está disponible temporalmente. Por favor intenta más tarde.',
  TIMEOUT_ERROR: 'La operación tardó demasiado tiempo. Por favor intenta nuevamente.',

  // Generic errors
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  FORBIDDEN: 'No tienes permisos para acceder a este recurso.',
  BAD_REQUEST: 'La solicitud contiene datos inválidos.',
  CONFLICT: 'El recurso ya existe o está en conflicto con otro.',
  METHOD_NOT_ALLOWED: 'Método HTTP no permitido para este recurso.',
} as const;

export type ErrorCode = keyof typeof ErrorMessages;

/**
 * Get error message with parameter substitution
 */
export function getErrorMessage(code: ErrorCode, params?: Record<string, string | number>): string {
  let message: string = ErrorMessages[code];

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, String(value));
    });
  }

  return message;
}

/**
 * Map HTTP status codes to error messages
 */
export function getErrorMessageByStatus(status: number): string {
  switch (status) {
    case 400:
      return ErrorMessages.BAD_REQUEST;
    case 401:
      return ErrorMessages.AUTH_UNAUTHORIZED;
    case 403:
      return ErrorMessages.FORBIDDEN;
    case 404:
      return ErrorMessages.NOT_FOUND;
    case 405:
      return ErrorMessages.METHOD_NOT_ALLOWED;
    case 409:
      return ErrorMessages.CONFLICT;
    case 429:
      return ErrorMessages.RATE_LIMIT_EXCEEDED;
    case 500:
      return ErrorMessages.INTERNAL_ERROR;
    case 503:
      return ErrorMessages.SERVICE_UNAVAILABLE;
    default:
      return ErrorMessages.INTERNAL_ERROR;
  }
}
