# Mobile-First Security Implementation

This document describes the mobile-first security features implemented in the BingeBook application.

## Features Implemented

### 1. Mobile Device Detection
- **Component**: `MobileOnlyWrapper`
- **Hook**: `useDeviceDetection`
- **Location**: `frontend/src/components/MobileOnlyWrapper.tsx`

The application automatically detects if the user is accessing from a desktop device and shows a mobile-only warning message.

**Detection Criteria:**
- Screen width ≤ 768px
- Mobile user agent strings (Android, iOS, etc.)
- Touch capability with reasonable screen width (≤ 1024px)

### 2. Desktop Warning Screen
- **Component**: `DesktopWarning`
- **Location**: `frontend/src/components/DesktopWarning.tsx`

Shows a friendly message encouraging users to access the site from mobile devices.

### 3. Security Restrictions
- **Hook**: `useSecurityRestrictions`
- **Location**: `frontend/src/hooks/useSecurityRestrictions.ts`

**Disabled Features:**
- Right-click context menu
- Developer tools shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, etc.)
- View source (Ctrl+U)
- Element inspector (Ctrl+Shift+C)
- Save page (Ctrl+S)
- Select all (Ctrl+A)
- Print (Ctrl+P)
- Text selection (except in input fields)
- Image dragging
- Print screen detection

**Additional Security:**
- Console warnings when developer tools are accessed
- Basic developer tools detection
- Disabled text highlighting
- Security meta tags in HTML

### 4. CSS Security Enhancements
- **Location**: `frontend/src/index.css`

**Features:**
- Disabled text selection globally (except inputs)
- Disabled image dragging
- Disabled drag and drop
- Transparent text selection
- Mobile viewport restrictions (no zoom)

## Development Mode

### Bypass Mobile Restrictions
For development and testing purposes, you can bypass the mobile-only restriction:

**Method 1: URL Parameter**
```
http://localhost:5173/?mobile-bypass=true
```

**Method 2: Console Commands**
```javascript
// Mobile bypass
mobileBypass.enable()
mobileBypass.disable()
mobileBypass.status()

// Security bypass (for testing security features)
securityBypass.enable()
securityBypass.disable()
securityBypass.status()
```

**Method 3: localStorage**
```javascript
// Mobile bypass
localStorage.setItem('mobile-bypass', 'true')

// Security bypass
localStorage.setItem('security-bypass', 'true')
```

**Method 4: URL Parameters**
```
// Bypass mobile restriction
http://localhost:5173/?mobile-bypass=true

// Bypass security restrictions
http://localhost:5173/?security-bypass=true

// Bypass both
http://localhost:5173/?mobile-bypass=true&security-bypass=true
```

### Security Restrictions in Development
Security restrictions can be bypassed in development mode using the bypass mechanism.

## Production Deployment

### Security Headers
The following security headers are included in the HTML:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Mobile Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

## Usage

The mobile-first security is automatically applied when the app starts. Simply wrap your app with `MobileOnlyWrapper`:

```tsx
import MobileOnlyWrapper from './components/MobileOnlyWrapper';

const App = () => (
  <MobileOnlyWrapper>
    {/* Your app content */}
  </MobileOnlyWrapper>
);
```

## Limitations

**Note**: These security measures provide basic protection but are not foolproof. Determined users can still:
- Disable JavaScript
- Use browser developer tools in various ways
- View page source through browser menu
- Use mobile device emulation in desktop browsers

These measures are primarily intended to:
1. Encourage mobile usage
2. Deter casual inspection
3. Provide a clear mobile-first user experience

## Testing

To test the mobile detection:
1. Resize your browser window to mobile width (≤768px)
2. Use browser developer tools device emulation
3. Use the bypass methods mentioned above for development

## Browser Compatibility

These features work in all modern browsers including:
- Chrome/Chromium-based browsers
- Firefox
- Safari
- Edge

Some features may have limited effectiveness in older browsers.