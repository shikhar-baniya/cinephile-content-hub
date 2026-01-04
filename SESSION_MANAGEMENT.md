# Session Management & Authentication

This document explains the improved session management system implemented to fix the login persistence issue.

## Problem Fixed

**Issue**: After logging in with Google, refreshing the page would ask the user to login again.

**Root Cause**: The application had two separate authentication systems that weren't properly synchronized:
1. Zustand auth store (`lib/auth.ts`) - with persistence
2. AuthService (`services/authService.ts`) - used by components

## Solution Implemented

### 1. Unified Authentication System
- **Primary System**: AuthService is now the single source of truth
- **Session Storage**: Uses `localStorage` with key `cinephile_session`
- **Token Management**: Automatic refresh before expiration
- **Persistence**: Sessions persist across browser refreshes and tabs

### 2. Enhanced Session Management Features

**Automatic Token Refresh**:
- Proactively refreshes tokens 10 minutes before expiration
- Background timer checks every 5 minutes
- Handles refresh failures gracefully

**Session Validation**:
- Validates session on app startup
- Checks session when tab becomes visible
- Expires invalid/corrupted sessions automatically

**Improved Error Handling**:
- Graceful fallback when token refresh fails
- Clear session data on authentication errors
- Detailed logging for debugging

### 3. Session Lifecycle

```
Login → Store Session → Background Refresh → Persist Until Logout/Expiry
```

**Login Flow**:
1. User clicks "Continue with Google"
2. Redirected to Google OAuth
3. Returns to `/auth/callback` with tokens
4. AuthService stores session with expiration
5. User redirected to app (or welcome if first time)

**Session Persistence**:
- Sessions stored in `localStorage` with expiration timestamp
- Automatic validation on page load
- Background refresh prevents expiration
- Manual refresh on tab focus

**Logout/Expiry**:
- Manual logout clears all data
- Expired sessions automatically cleared
- Failed refresh attempts trigger logout

## Development & Testing

### Debug Tools (Development Only)

**Session Debug Console Commands**:
```javascript
// Check current session status
sessionDebug.check()

// Clear session (force logout)
sessionDebug.clear()

// Check mobile/security bypass status
mobileBypass.status()
securityBypass.status()
```

**Session Information Displayed**:
- User email
- Expiration time
- Minutes until expiry
- Refresh token availability
- Session validity

### Testing Session Persistence

1. **Login Test**:
   - Login with Google
   - Refresh the page
   - Should remain logged in

2. **Tab Switch Test**:
   - Login and switch to another tab
   - Return after some time
   - Should still be logged in

3. **Token Refresh Test**:
   - Login and wait (or manually set expiration)
   - Session should refresh automatically
   - Check console for refresh logs

4. **Expiry Test**:
   - Manually clear refresh token from localStorage
   - Wait for expiration
   - Should automatically logout

### Session Configuration

**Default Settings**:
- **Session Duration**: Based on OAuth provider (typically 1 hour)
- **Refresh Interval**: Every 5 minutes
- **Refresh Threshold**: 10 minutes before expiry
- **Storage Key**: `cinephile_session`

**Customizable Options**:
- Refresh interval can be adjusted in AuthService constructor
- Refresh threshold can be modified in `startTokenRefreshTimer`
- Session validation frequency in visibility listener

## Security Considerations

**Token Storage**:
- Access tokens stored in localStorage (acceptable for SPA)
- Refresh tokens included for automatic renewal
- Sessions expire automatically

**Session Validation**:
- Tokens validated on every API request
- Expired sessions cleared immediately
- Invalid tokens trigger re-authentication

**Cross-Tab Synchronization**:
- Sessions shared across tabs via localStorage
- Logout in one tab affects all tabs
- Session updates propagated via auth state listeners

## Troubleshooting

### Common Issues

**"Session not persisting"**:
- Check browser localStorage is enabled
- Verify `cinephile_session` key exists
- Use `sessionDebug.check()` to inspect session

**"Token refresh failing"**:
- Check network connectivity
- Verify backend refresh endpoint
- Check refresh token validity

**"Automatic logout"**:
- Session may have expired
- Refresh token may be invalid
- Check console for error messages

### Debug Steps

1. Open browser dev tools
2. Run `sessionDebug.check()` in console
3. Check localStorage for `cinephile_session`
4. Monitor network requests for token refresh
5. Check console logs for auth-related messages

## Browser Compatibility

**Supported Features**:
- localStorage (all modern browsers)
- Visibility API (for tab focus detection)
- setInterval (for background refresh)

**Fallback Behavior**:
- Manual session validation if visibility API unavailable
- Graceful degradation if localStorage restricted
- Console warnings for unsupported features

## Performance Impact

**Minimal Overhead**:
- Background timer: ~1KB memory, minimal CPU
- Session validation: Only on app startup and tab focus
- Token refresh: Only when needed (10 min before expiry)

**Optimizations**:
- Lazy session validation
- Efficient localStorage usage
- Minimal network requests for refresh