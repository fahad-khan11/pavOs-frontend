# Whop Theme Sync Testing Guide

## Overview
The `WhopThemeSync` component automatically detects and applies themes from Whop. It checks multiple sources in priority order:
1. HTML class on `<html>` element (Whop forwards theme via classes)
2. URL parameter (`?theme=dark` or `?theme=light`)
3. Parent window theme (if embedded in iframe)
4. localStorage fallback
5. System preference

## Testing Methods

### Method 1: Test Locally with URL Parameter

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Open your app with theme parameter:**
   - Dark theme: `http://localhost:3000/dashboard?theme=dark`
   - Light theme: `http://localhost:3000/dashboard?theme=light`

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for: `Theme changed to dark (from URL)` or `Theme changed to light (from URL)`

4. **Verify visual changes:**
   - Dark theme: Dark backgrounds, light text
   - Light theme: Light backgrounds, dark text

### Method 2: Test with HTML Class Manipulation (Simulates Whop)

1. **Open your app:** `http://localhost:3000/dashboard`

2. **Open browser console (F12)**

3. **Manually add/remove dark class:**
   ```javascript
   // Add dark theme
   document.documentElement.classList.add("dark")
   
   // Remove dark theme (light theme)
   document.documentElement.classList.remove("dark")
   ```

4. **Watch console logs:**
   - Should see: `Theme changed to dark (from Whop class)` or `Theme changed to light (from Whop class)`

5. **Verify the UI updates automatically**

### Method 3: Test PostMessage (Simulates Whop iframe communication)

1. **Open your app:** `http://localhost:3000/dashboard`

2. **Open browser console (F12)**

3. **Simulate Whop postMessage:**
   ```javascript
   // Simulate dark theme message from Whop
   window.postMessage({
     type: "theme-change",
     theme: "dark"
   }, "*")
   
   // Simulate light theme message from Whop
   window.postMessage({
     type: "theme-change",
     theme: "light"
   }, "*")
   ```

4. **Note:** The actual implementation checks `event.origin.includes("whop.com")`, so this test won't work directly. For real testing, you need to be embedded in Whop.

### Method 4: Test in Whop Dashboard (Real Environment)

1. **Deploy your app** to your hosting (Vercel, etc.)

2. **Access via Whop Dashboard:**
   - Go to your Whop app dashboard
   - Navigate to your app
   - The app should automatically detect Whop's theme

3. **Change theme in Whop:**
   - Go to Whop settings
   - Toggle between dark/light theme
   - Your app should automatically update

4. **Check browser console:**
   - Open DevTools (F12)
   - Look for theme change logs

### Method 5: Test with MutationObserver (Class Changes)

1. **Open your app:** `http://localhost:3000/dashboard`

2. **Open browser console (F12)**

3. **Run this script to simulate Whop changing classes:**
   ```javascript
   // Simulate Whop adding dark class
   document.documentElement.classList.add("dark")
   
   // Wait 1 second, then remove it
   setTimeout(() => {
     document.documentElement.classList.remove("dark")
   }, 1000)
   ```

4. **The MutationObserver should detect the change automatically**

## Verification Checklist

- [ ] Theme changes when URL parameter is added (`?theme=dark`)
- [ ] Theme changes when HTML class is added/removed (`class="dark"`)
- [ ] Console logs show correct source (URL, Whop class, etc.)
- [ ] UI colors update correctly (backgrounds, text, borders)
- [ ] Theme persists when navigating between pages
- [ ] Theme syncs when embedded in Whop dashboard
- [ ] No manual theme toggle button is visible (should be removed)

## Debugging

### Check if WhopThemeSync is loaded:
```javascript
// In browser console
document.querySelector('[data-theme-sync]') // Should find the component
```

### Check current theme:
```javascript
// In browser console
document.documentElement.classList.contains("dark") // true = dark, false = light
```

### Check localStorage:
```javascript
// In browser console
localStorage.getItem("theme") // Should show current theme or null
```

### Force theme change:
```javascript
// In browser console
document.documentElement.classList.toggle("dark")
```

## Expected Console Output

When theme changes, you should see:
```
Theme changed to dark (from URL)
Theme changed to light (from Whop class)
Theme changed to dark (from postMessage from Whop)
Theme changed to light (from Parent window)
```

## Common Issues

1. **Theme not changing:**
   - Check browser console for errors
   - Verify `WhopThemeSync` is in `layout.tsx`
   - Check if `ThemeProvider` is configured correctly

2. **Theme flickering:**
   - This is normal during initial load
   - Should stabilize after first detection

3. **Theme not syncing with Whop:**
   - Ensure app is accessed via Whop dashboard (not direct URL)
   - Check if app is embedded in iframe
   - Verify Whop is sending theme via classes or postMessage

