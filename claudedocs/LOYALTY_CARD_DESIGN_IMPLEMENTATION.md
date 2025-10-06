# LOYALTY CARD DESIGN IMPLEMENTATION
**Problema**: La tarjeta de lealtad no respeta el diseño configurado en onboarding
**Objetivo**: Cliente recibe tarjeta con diseño personalizado + QR + link de seguimiento

---

## 📊 ANÁLISIS DE IMPLEMENTACIÓN ACTUAL

### ✅ Lo que SÍ existe:
1. **Base de datos**:
   - `businesses.card_design` (JSONB) - Almacena diseño configurado
   - `businesses.brand_colors` (JSONB) - Colores primario/acento
   - `businesses.logo_url` (TEXT) - URL del logo
   - `businesses.background_image_url` (TEXT) - Imagen de fondo
   - `businesses.reward_structure` (JSONB) - Estructura de recompensas

2. **Flujo de Onboarding**:
   - `DesignStep` component captura diseño personalizado
   - Se guarda en `businesses.card_design` via API
   - Incluye: template, colores, logo, fondo, gradientes

3. **Página de tarjeta existente**:
   - `/card/[customerId]` - Vista básica sin diseño
   - Muestra QR genérico, progreso, historial
   - NO usa `card_design` del negocio

### ❌ Lo que FALTA:

1. **Integración de diseño**:
   - `/card/[customerId]` no consulta `card_design`
   - QR es genérico (blanco/negro), no respeta colores
   - No muestra logo, fondo ni branding del negocio

2. **Flujo de enrollment**:
   - `/enroll/[businessId]` genera QR simple
   - No redirige a `/card/[customerId]` después de registro
   - No se envía link de tarjeta personalizada

3. **Escaneo de comercio**:
   - No existe `/scan/[qrData]` para que comercio valide
   - No hay endpoint `/api/v1/stamps` para agregar sellos
   - Falta UI de cantidad variable (1±) de sellos

---

## 🎯 DISEÑO DE SOLUCIÓN

### 1️⃣ Actualizar GET /api/v1/customers/:id
**Archivo**: `/src/api/customers/customers.routes.ts`

```typescript
// ACTUAL: Solo devuelve customer data
// NUEVO: Incluir business.card_design, brand_colors, logo_url

GET /api/v1/customers/:id
Response:
{
  data: {
    customer: { id, name, phone, stamps_count, ... },
    business: {
      id, name, logo_url, background_image_url,
      card_design: { template, primaryColor, accentColor, useGradient, ... },
      brand_colors: { primary, accent },
      reward_structure: { stamps_required, reward_description }
    }
  }
}
```

**Cambios**:
- JOIN con `businesses` table
- SELECT card_design, brand_colors, logo_url, background_image_url
- Devolver en response

---

### 2️⃣ Actualizar /card/[customerId] con diseño personalizado
**Archivo**: `/frontend/src/app/card/[customerId]/page.tsx`

**Cambios**:
1. Fetch incluye `business.card_design`
2. Aplicar colores personalizados:
```typescript
const { primaryColor, accentColor, useGradient } = business.card_design;
const bgStyle = useGradient
  ? { background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }
  : { backgroundColor: primaryColor };
```

3. Mostrar logo y fondo si existen:
```typescript
{business.background_image_url && (
  <div style={{
    backgroundImage: `url(${business.background_image_url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}>
)}
```

4. QR personalizado con colores del negocio:
```typescript
const qrUrl = await QRCode.toDataURL(qrData, {
  width: 400,
  color: {
    dark: business.card_design.primaryColor || '#000000',
    light: '#FFFFFF'
  }
});
```

5. Grid de sellos con colores personalizados:
```typescript
className={`
  ${i < stamps_count
    ? `bg-gradient-to-br from-[${primaryColor}] to-[${accentColor}]`
    : 'bg-gray-100'
  }
`}
```

---

### 3️⃣ Actualizar /enroll/[businessId] para redirigir a tarjeta
**Archivo**: `/frontend/src/app/enroll/[businessId]/page.tsx`

**Cambios después de enrollment exitoso**:
```typescript
// ACTUAL:
setSuccess(true);
setQrCodeDataUrl(qrUrl); // Muestra QR inline

// NUEVO:
const cardUrl = `${window.location.origin}/card/${data.data.customer_id}`;
setSuccess(true);
setCardUrl(cardUrl);

// Ofrecer opciones:
// 1. Abrir tarjeta en nueva pestaña
// 2. Copiar link
// 3. Descargar QR
```

**UI Success**:
```tsx
{success && (
  <div className="bg-green-50 p-6 rounded-lg">
    <h3>¡Registro Exitoso!</h3>
    <p>Tu tarjeta de lealtad está lista</p>

    <a href={cardUrl} target="_blank" className="btn-primary">
      Ver Mi Tarjeta
    </a>

    <button onClick={() => navigator.clipboard.writeText(cardUrl)}>
      Copiar Link de Tarjeta
    </button>

    <p className="text-xs">Guarda este link para acceder a tu tarjeta</p>
  </div>
)}
```

---

### 4️⃣ Crear página de escaneo para comercio
**Archivo NUEVO**: `/frontend/src/app/scan/page.tsx`

**Ruta**: `/scan?data={qrData}` o `/scan/[customerId]`

**Funcionalidad**:
1. **Escaneo de QR**:
   - Usa `html5-qrcode` (ya instalado)
   - Decodifica `{ customer_id, business_id }`
   - Valida que comercio autenticado pertenece a business_id

2. **UI de confirmación**:
```tsx
<Card>
  <h2>{customer.name}</h2>
  <p>{customer.phone}</p>

  <div className="stamp-counter">
    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
    <span className="text-3xl font-bold">{quantity}</span>
    <button onClick={() => setQuantity(quantity + 1)}>+</button>
  </div>

  <p>Agregar {quantity} {quantity === 1 ? 'sello' : 'sellos'}</p>

  <div className="progress-preview">
    <p>Progreso actual: {stamps_count}/{required}</p>
    <p>Después: {stamps_count + quantity}/{required}</p>
  </div>

  <button onClick={handleAddStamps} disabled={adding}>
    Confirmar {quantity} {quantity === 1 ? 'Venta' : 'Ventas'}
  </button>
</Card>
```

3. **Validaciones**:
```typescript
// Verificar autenticación
if (!user || !user.user_metadata?.business_id) {
  return <RequireAuth message="Debes iniciar sesión para escanear" />;
}

// Verificar que QR pertenece al negocio
if (qrData.business_id !== user.user_metadata.business_id) {
  return <Error message="Este QR no pertenece a tu negocio" />;
}
```

---

### 5️⃣ Crear endpoint POST /api/v1/stamps
**Archivo**: `/src/api/stamps/stamps.routes.ts`

```typescript
/**
 * POST /api/v1/stamps - Add stamps to customer
 * Requires authentication (business owner)
 */
router.post('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { customer_id, quantity = 1 } = req.body;

    // Validaciones
    const customer = await CustomerService.findById(customer_id);
    if (!customer) throw new NotFoundError('Customer not found');

    // Verify customer belongs to authenticated business
    if (customer.business_id !== req.user!.businessId) {
      throw new ForbiddenError('Customer does not belong to your business');
    }

    // Get reward structure
    const business = await BusinessService.findById(customer.business_id);
    const stampsRequired = business.reward_structure.stamps_required;

    // Calculate new stamps
    const stampsBefore = customer.stamps_count;
    let stampsAfter = stampsBefore + quantity;
    let rewardEarned = false;

    // Check if reward unlocked
    if (stampsAfter >= stampsRequired) {
      rewardEarned = true;
      stampsAfter = stampsAfter - stampsRequired; // Reset with remainder

      // Update customer rewards earned
      await supabaseAdmin
        .from('customers')
        .update({
          stamps_count: stampsAfter,
          total_rewards_earned: customer.total_rewards_earned + 1,
          last_stamp_at: new Date().toISOString(),
          version: customer.version + 1
        })
        .eq('id', customer_id)
        .eq('version', customer.version);
    } else {
      // Just add stamps
      await supabaseAdmin
        .from('customers')
        .update({
          stamps_count: stampsAfter,
          last_stamp_at: new Date().toISOString(),
          version: customer.version + 1
        })
        .eq('id', customer_id)
        .eq('version', customer.version);
    }

    // Record stamp transaction
    await supabaseAdmin
      .from('stamps')
      .insert({
        customer_id,
        business_id: customer.business_id,
        stamped_by: req.user!.email,
        stamps_before: stampsBefore,
        stamps_after: stampsAfter,
        is_reward_redemption: rewardEarned,
        metadata: { quantity, reward_earned: rewardEarned }
      });

    res.json({
      data: {
        stamps_added: quantity,
        stamps_before: stampsBefore,
        stamps_after: stampsAfter,
        reward_earned: rewardEarned,
        total_rewards: customer.total_rewards_earned + (rewardEarned ? 1 : 0)
      }
    });

  } catch (error) {
    next(error);
  }
});
```

---

### 6️⃣ Actualizar business routes para incluir card_design
**Archivo**: `/src/api/businesses/businesses.routes.ts`

```typescript
// GET /api/v1/businesses/:id (ya existe pero falta card_design)
const { data: business, error } = await supabaseAdmin
  .from('businesses')
  .select(`
    id, name, logo_url, background_image_url,
    card_design, brand_colors, reward_structure,
    is_active, created_at
  `)
  .eq('id', id)
  .single();
```

---

## 📋 PLAN DE IMPLEMENTACIÓN

### Fase 1: Backend API (30 min)
1. ✅ Crear `/src/api/stamps/stamps.routes.ts`
2. ✅ Endpoint POST `/api/v1/stamps` con validaciones
3. ✅ Actualizar GET `/api/v1/businesses/:id` incluir card_design
4. ✅ Actualizar GET `/api/v1/customers/:id` incluir business data

### Fase 2: Página de Tarjeta con Diseño (45 min)
1. ✅ Actualizar `/card/[customerId]/page.tsx`
2. ✅ Aplicar card_design: colores, logo, fondo
3. ✅ QR personalizado con colores del negocio
4. ✅ Grid de sellos con branding
5. ✅ Responsive y PWA-ready

### Fase 3: Flujo de Enrollment (20 min)
1. ✅ Actualizar success en `/enroll/[businessId]`
2. ✅ Generar link de tarjeta
3. ✅ UI: "Ver Tarjeta", "Copiar Link", "Descargar QR"

### Fase 4: Escaneo de Comercio (60 min)
1. ✅ Crear `/scan/page.tsx`
2. ✅ HTML5 QR Code scanner
3. ✅ UI contador de sellos (1±)
4. ✅ Preview de progreso
5. ✅ Confirmación y feedback
6. ✅ Animación de recompensa desbloqueada

---

## 🎨 ESTRUCTURA DE card_design

```typescript
interface CardDesign {
  template: 'classic' | 'modern' | 'minimal';
  primaryColor: string;      // hex color
  accentColor: string;       // hex color
  useGradient: boolean;
  logoUrl?: string;
  backgroundUrl?: string;
  stampShape: 'circle' | 'star' | 'heart';
  fontSize: 'small' | 'medium' | 'large';
}
```

**Ejemplo guardado en DB**:
```json
{
  "template": "modern",
  "primaryColor": "#9333EA",
  "accentColor": "#F97316",
  "useGradient": true,
  "logoUrl": "https://qonybpev...supabase.co/uploads/logo.png",
  "backgroundUrl": null,
  "stampShape": "star",
  "fontSize": "medium"
}
```

---

## 🔐 SEGURIDAD

### QR Code Data Structure:
```json
{
  "customer_id": "uuid",
  "business_id": "uuid",
  "issued_at": "timestamp"
}
```

### Validaciones en /scan:
1. ✅ Comercio autenticado
2. ✅ `business_id` en QR == `user.business_id`
3. ✅ Customer existe y pertenece al business
4. ✅ Optimistic concurrency (version check)

---

## 📱 UX FLOWS

### Cliente se registra:
1. Escanea QR de negocio → `/enroll/{businessId}`
2. Completa formulario (nombre, teléfono, email)
3. POST `/api/v1/enrollments` → Crea customer
4. Success: "¡Tarjeta lista!" + link a `/card/{customerId}`
5. Cliente guarda link o abre tarjeta

### Cliente muestra tarjeta:
1. Abre link `/card/{customerId}`
2. Ve tarjeta con diseño del negocio
3. Muestra QR al comercio
4. Comercio escanea

### Comercio escanea:
1. Dashboard → "Escanear QR"
2. Cámara abre, escanea QR de cliente
3. Redirige a `/scan?data={qrData}`
4. Muestra: nombre, teléfono, progreso actual
5. Selector de cantidad: 1± sellos
6. "Confirmar {n} Venta(s)"
7. POST `/api/v1/stamps`
8. Success: "¡{n} sello(s) agregado(s)!"
9. Si reward desbloqueado: "🎁 ¡Recompensa desbloqueada!"

---

## ✅ ACCEPTANCE CRITERIA

### Tarjeta personalizada:
- [ ] Logo del negocio visible
- [ ] Colores configurados en onboarding aplicados
- [ ] Fondo de imagen si fue configurado
- [ ] QR con color personalizado
- [ ] Grid de sellos con branding
- [ ] Responsive en móvil

### Flujo de enrollment:
- [ ] Después de registro, muestra link de tarjeta
- [ ] "Ver Tarjeta" abre nueva pestaña
- [ ] "Copiar Link" copia URL
- [ ] Link funciona en cualquier navegador

### Escaneo de comercio:
- [ ] Solo comercio autenticado puede escanear
- [ ] Valida que QR pertenece a su negocio
- [ ] Puede agregar 1-10 sellos de una vez
- [ ] Preview de progreso antes de confirmar
- [ ] Detecta recompensa desbloqueada
- [ ] Animación de éxito

---

## 🚀 NEXT STEPS

1. Implementar Fase 1 (Backend)
2. Implementar Fase 2 (Tarjeta con diseño)
3. Implementar Fase 3 (Enrollment flow)
4. Implementar Fase 4 (Scanner)
5. Testing end-to-end
6. Deploy

**Tiempo estimado total**: 2.5 - 3 horas
