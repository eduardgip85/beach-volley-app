# Guia completa: Sandset Android, Firebase y notificaciones push

Esta guia explica como conectar Firebase Cloud Messaging con Sandset, configurar
Supabase para enviar notificaciones push y generar una primera APK Android.

## Arquitectura preparada

El flujo implementado funciona asi:

```text
Ocurre una accion en Sandset
        |
        v
Supabase crea una fila en public.notifications
        |
        v
Database Webhook llama a la Edge Function send-push
        |
        v
send-push consulta preferencias y dispositivos del usuario
        |
        v
Firebase Cloud Messaging entrega la notificacion a Android
```

Firebase solo se utiliza para entregar las notificaciones al dispositivo.
Usuarios, eventos, preferencias y notificaciones continuan gestionandose con
Supabase.

## Archivos ya preparados

- Identificador Android: `app.sandset.mobile`
- Iconos Android: `android/app/src/main/res/mipmap-*`
- Splash screens: `android/app/src/main/res/drawable-*`
- Icono blanco de notificaciones:
  `android/app/src/main/res/drawable/push_icon.png`
- Fuentes de alta resolucion:
  - `resources/icon.png`
  - `resources/splash.png`
- SQL para dispositivos push:
  `sql/2026-06-08_push_notifications.sql`
- Edge Function:
  `supabase/functions/send-push/index.ts`

## 1. Instalar herramientas necesarias

### Android Studio y Java

1. Descarga e instala Android Studio:
   <https://developer.android.com/studio>
2. Durante la instalacion incluye:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device, si quieres usar emulador
3. Abre Android Studio una vez y deja que termine de instalar componentes.

Android Studio incluye un JDK dentro de su carpeta `jbr`. Si PowerShell no
encuentra Java, configura temporalmente:

```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
java -version
```

Para conservarlo en futuras terminales:

```powershell
[Environment]::SetEnvironmentVariable(
  "JAVA_HOME",
  "C:\Program Files\Android\Android Studio\jbr",
  "User"
)
```

Cierra y vuelve a abrir PowerShell despues de guardar la variable.

### Supabase CLI

Comprueba si ya esta disponible:

```powershell
npx supabase --version
```

Si funciona, utiliza `npx supabase` en los comandos de esta guia. No es
necesario instalarlo globalmente.

## 2. Crear el proyecto Firebase

1. Entra en <https://console.firebase.google.com/>.
2. Pulsa **Crear un proyecto**.
3. Nombre recomendado: `Sandset`.
4. Google Analytics para Firebase es opcional para las notificaciones push.
5. Espera a que Firebase termine de crear el proyecto.

No necesitas mover la base de datos ni los usuarios a Firebase.

## 3. Registrar la aplicacion Android en Firebase

1. Dentro del proyecto Firebase, pulsa el icono de Android.
2. Introduce exactamente este nombre de paquete:

```text
app.sandset.mobile
```

3. Apodo recomendado: `Sandset Android`.
4. Para notificaciones push no necesitas introducir SHA-1 en este momento.
5. Pulsa **Registrar aplicacion**.
6. Descarga `google-services.json`.
7. Coloca el archivo en:

```text
android/app/google-services.json
```

La ruta final debe ser exactamente:

```text
beach-volley-app/android/app/google-services.json
```

Este archivo esta ignorado por git y no debe subirse al repositorio.

## 4. Activar Firebase Cloud Messaging API

1. En Firebase abre:
   **Configuracion del proyecto > Cloud Messaging**.
2. Comprueba que aparece Firebase Cloud Messaging API HTTP v1.
3. Si Firebase indica que no esta habilitada, abre el enlace de Google Cloud y
   activa **Firebase Cloud Messaging API**.

Sandset utiliza la API HTTP v1, no la API Legacy.

## 5. Crear una cuenta de servicio de Firebase

La Edge Function necesita una credencial privada para enviar notificaciones.

1. En Firebase abre:
   **Configuracion del proyecto > Cuentas de servicio**.
2. Pulsa **Generar nueva clave privada**.
3. Confirma la descarga del JSON.
4. Guarda el archivo fuera del repositorio.

Este JSON contiene una clave privada. No debe colocarse dentro del proyecto,
subirse a git, enviarse por chat ni exponerse en el frontend.

## 6. Aplicar el SQL de dispositivos push en Supabase

1. Entra en tu proyecto desde <https://supabase.com/dashboard>.
2. Abre **SQL Editor**.
3. Crea una consulta nueva.
4. Copia y ejecuta el contenido de:

```text
sql/2026-06-08_push_notifications.sql
```

Este SQL crea:

- Tabla `public.push_devices`.
- Un token por instalacion Android.
- Politicas RLS para que cada usuario gestione solo sus dispositivos.

Comprueba en **Table Editor** que existe `push_devices`.

## 7. Enlazar Supabase CLI con el proyecto

Desde la carpeta `beach-volley-app`:

```powershell
npx supabase login
```

Se abrira el navegador para iniciar sesion.

Despues enlaza el proyecto:

```powershell
npx supabase link --project-ref yphipbhteoaydmfquxhe
```

Puedes encontrar `TU_PROJECT_REF` en la URL del Dashboard de Supabase o en:
**Project Settings > General**.

## 8. Guardar la credencial Firebase como secreto de Supabase

La opcion mas segura en PowerShell es leer el JSON y convertirlo a una sola
linea:

```powershell
$firebaseJson = Get-Content "C:\ruta\segura\firebase-service-account.json" -Raw |
  ConvertFrom-Json |
  ConvertTo-Json -Compress

npx supabase secrets set FIREBASE_SERVICE_ACCOUNT_JSON="$firebaseJson"
```

Comprueba que el secreto existe:

```powershell
npx supabase secrets list
```

El valor secreto no deberia mostrarse, solamente su nombre.

No utilices variables `VITE_*` para esta credencial. Las variables Vite llegan
al navegador y expondrían la clave privada.

## 9. Desplegar la Edge Function send-push

Desde `beach-volley-app`:

```powershell
npx supabase functions deploy send-push --no-verify-jwt
```

Se utiliza `--no-verify-jwt` porque la funcion sera llamada por un Database
Webhook interno de Supabase, no directamente por un usuario.

Comprueba en el Dashboard:

```text
Edge Functions > send-push
```

La funcion utiliza automaticamente:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FIREBASE_SERVICE_ACCOUNT_JSON`

## 10. Crear el Database Webhook

El webhook conecta las notificaciones internas con la Edge Function.

1. En Supabase Dashboard abre **Database > Webhooks**.
2. Pulsa **Create a new hook**.
3. Nombre recomendado:

```text
send-notification-push
```

4. Configura:
   - Tabla: `public.notifications`
   - Evento: solamente `INSERT`
   - Tipo: Supabase Edge Function
   - Edge Function: `send-push`
   - Metodo: `POST`
5. Añade el header de autorizacion con service role si el Dashboard ofrece esa
   opcion.
6. Guarda el webhook.

No selecciones `UPDATE`, porque `send-push` actualiza `push_sent_at` despues de
enviar y podria provocar llamadas innecesarias.

## 11. Sincronizar el proyecto Android

Desde `beach-volley-app`:

```powershell
npm install
npx cap sync android
```

Debes ver el plugin:

```text
@capacitor/push-notifications
```

Si has cambiado frontend antes de probar Android:

```powershell
npm run build
npx cap sync android
```

## 12. Abrir y ejecutar Sandset en Android

Abre el proyecto:

```powershell
npx cap open android
```

En Android Studio:

1. Espera a que termine Gradle Sync.
2. Conecta un movil Android por USB o crea un emulador.
3. En un movil real activa:
   - Opciones de desarrollador
   - Depuracion USB
4. Selecciona el dispositivo.
5. Pulsa **Run**.

Para probar notificaciones push es recomendable utilizar un dispositivo real
con Google Play Services.

## 13. Activar push dentro de Sandset

En la app Android:

1. Inicia sesion.
2. Abre **Notificaciones**.
3. Abre **Preferencias**.
4. Activa **Notificaciones push**.
5. Pulsa **Guardar preferencias**.
6. Android pedira permiso para mostrar notificaciones.
7. Acepta el permiso.

Comprueba en Supabase:

```text
Table Editor > push_devices
```

Debe aparecer una fila con:

- `user_id`: usuario conectado.
- `platform`: `android`.
- `token`: token FCM del dispositivo.
- `enabled`: `true`.

## 14. Probar una notificacion real

Utiliza dos cuentas:

1. Cuenta A inicia sesion en la app Android y activa push.
2. Cuenta B envia una solicitud de amistad o invitacion a un evento.
3. Supabase crea una fila en `notifications`.
4. El webhook llama a `send-push`.
5. El movil de Cuenta A recibe la notificacion.
6. Pulsa la notificacion.
7. Sandset debe abrir la pantalla correspondiente.

Tambien puedes comprobar:

- `notifications.push_sent_at` contiene una fecha.
- Logs de la funcion en:
  **Supabase Dashboard > Edge Functions > send-push > Logs**.

## 15. Generar una APK de prueba

Con Java y Android SDK configurados:

```powershell
cd android
.\gradlew.bat assembleDebug
```

La APK de debug se genera normalmente en:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Esta APK sirve para instalar y probar Sandset manualmente. No es la version que
se sube a Google Play.

## 16. Preparar una version para Google Play

Google Play utiliza preferentemente Android App Bundles `.aab`.

Antes de generar la version:

1. Confirma que `app.sandset.mobile` sera el identificador definitivo.
2. Define version:
   - `versionCode`: numero entero que aumenta en cada publicacion.
   - `versionName`: version visible, por ejemplo `1.0.0-beta.1`.
3. Crea y protege una clave de firma release.
4. Nunca pierdas ni publiques la clave de firma.

Desde Android Studio puedes utilizar:

```text
Build > Generate Signed App Bundle or APK > Android App Bundle
```

La primera publicacion recomendable es **Internal Testing**, no produccion.

## Diagnostico de problemas

### `JAVA_HOME is not set`

Configura el JDK incluido con Android Studio:

```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
java -version
```

### No aparece ninguna fila en `push_devices`

Comprueba:

1. Estas ejecutando la app nativa Android, no la web.
2. Has iniciado sesion.
3. Has activado push y guardado preferencias.
4. Has aceptado el permiso Android.
5. Existe `android/app/google-services.json`.
6. Has ejecutado `npx cap sync android` despues de añadirlo.

### Se registra el dispositivo pero no llega ninguna push

Comprueba:

1. `notification_preferences.push_enabled` es `true`.
2. La categoria correspondiente esta activada.
3. Existe el webhook `INSERT` sobre `public.notifications`.
4. La funcion `send-push` esta desplegada.
5. Existe el secreto `FIREBASE_SERVICE_ACCOUNT_JSON`.
6. Mira los logs de `send-push`.
7. Comprueba que Firebase Cloud Messaging API HTTP v1 esta habilitada.

### Llega la push pero al pulsarla no abre la pantalla correcta

Comprueba el campo `deep_link` de la fila en `notifications`. Debe empezar por
`/`, por ejemplo:

```text
/events/ID_DEL_EVENTO
/friends
/notifications
```

### El icono de la notificacion aparece como un cuadrado

El manifest ya utiliza:

```text
@drawable/push_icon
```

Ejecuta de nuevo:

```powershell
npx cap sync android
```

Luego desinstala la version anterior del movil y vuelve a instalarla.

## Seguridad

Nunca subas a git:

- `android/app/google-services.json`
- JSON de cuenta de servicio Firebase
- Claves de firma Android
- Contraseñas o secretos Supabase

El `.gitignore` ya protege los archivos Firebase principales, pero conviene
comprobar siempre antes de hacer commit:

```powershell
git status
```

## Checklist final

- [ ] Android Studio instalado.
- [ ] Java funciona desde PowerShell.
- [ ] Proyecto Firebase creado.
- [ ] App Firebase registrada como `app.sandset.mobile`.
- [ ] `google-services.json` colocado en `android/app`.
- [ ] API HTTP v1 de Firebase Cloud Messaging habilitada.
- [ ] SQL `2026-06-08_push_notifications.sql` ejecutado.
- [ ] Supabase CLI enlazado al proyecto.
- [ ] Secreto `FIREBASE_SERVICE_ACCOUNT_JSON` configurado.
- [ ] Edge Function `send-push` desplegada.
- [ ] Webhook `INSERT public.notifications` creado.
- [ ] Proyecto sincronizado con `npx cap sync android`.
- [ ] Token visible en `push_devices`.
- [ ] Push real recibida y deep link probado.
- [ ] APK debug generada e instalada.

Cuando todo este checklist funcione, Sandset estara preparada para comenzar una
beta Android privada.
