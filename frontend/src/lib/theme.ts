// Theme configuration for easy color and font management
export const theme = {
  // Font configuration
  fonts: {
    primary: 'font-inter',     // Main font for body text
    heading: 'font-inter',     // Font for headings
    mono: 'font-mono',         // Monospace font for code
    
    sizes: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-lg',
      '2xl': 'text-sm',
      '3xl': 'text-xs',
    },
    
    weights: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },
  
  // Form colors
  form: {
    header: {
      add: 'bg-gradient-to-r from-primary via-primary-light to-secondary',
      edit: 'bg-gradient-to-r from-accent via-accent-light to-secondary',
      details: 'bg-gradient-to-r from-secondary via-primary to-primary-light'
    },
    sections: {
      personal: 'bg-gradient-to-r from-muted/50 to-muted',
      academic: 'bg-gradient-to-r from-accent/10 to-accent/20',
      security: 'bg-gradient-to-r from-secondary/10 to-secondary/20',
      contact: 'bg-gradient-to-r from-primary/10 to-primary/20'
    },
    icons: {
      personal: 'text-muted-foreground',
      academic: 'text-accent',
      security: 'text-secondary',
      contact: 'text-primary'
    }
  },
  
  // Common UI elements
  ui: {
    card: 'bg-card rounded-xl shadow-subtle border border-border',
    input: 'border-input focus:border-primary focus:ring-2 focus:ring-primary/20',
    button: {
      primary: 'bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-primary-foreground',
      secondary: 'bg-gradient-to-r from-accent to-accent-light hover:from-accent-light hover:to-accent text-accent-foreground'
    },
    text: {
      primary: 'text-foreground',
      secondary: 'text-muted-foreground',
      error: 'text-destructive'
    }
  }
};