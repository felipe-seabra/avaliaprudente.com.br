'use client'

export function CookiePreferenceButton() {
  return (
    <button 
      onClick={() => {
        localStorage.removeItem('avaliaprudente_cookie_consent');
        window.location.reload();
      }} 
      className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-left"
    >
      Preferências de Cookies
    </button>
  )
}
