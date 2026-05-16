// Theme configuration for consistent color, typography and spacing tokens,
// shared by all student pages (Add, Edit, Details) and the wider application.
export const theme = {
  // ---------------------------------------------------------------------------
  // Typography
  // ---------------------------------------------------------------------------
  fonts: {
    primary:    'font-nunito',
    heading:    'font-montserrat',
    mono:       'font-mono',
    rtl:        'font-vazirmatn',
    sizes: {
      xs:   'text-xs',
      sm:   'text-sm',
      base: 'text-base',
      lg:   'text-lg',
      xl:   'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
    },
    weights: {
      normal:   'font-normal',
      medium:   'font-medium',
      semibold: 'font-semibold',
      bold:     'font-bold',
    },
  },

  // ---------------------------------------------------------------------------
  // Palette
  // ---------------------------------------------------------------------------
  color: {
    // Semantic aliases
    primary: {
      DEFAULT: 'text-primary',
      light:   'hover:text-primary-light',
      dark:    'text-primary-dark',
    },
    secondary: {
      DEFAULT: 'text-foreground',
      light:   'text-muted-foreground',
    },
    accent: {
      DEFAULT: 'text-accent',
      light:   'text-accent-light',
    },
    success: {
      DEFAULT: 'text-success',
      light:   'text-success-light',
    },
    warning: {
      DEFAULT: 'text-warning',
      light:   'text-warning-light',
    },
    destructive: {
      DEFAULT: 'text-destructive',
      light:   'text-destructive-light',
    },
    // Neutral
    muted:      'text-muted-foreground',
    foreground: 'text-foreground',
    link:       'text-primary',
  },

  // ---------------------------------------------------------------------------
  // Form sections
  // ---------------------------------------------------------------------------
  form: {
    // Wrapper card applied to each field-group / fieldset
    sectionCard: 'p-4 rounded-xl border border-border bg-card shadow-subtle',

    // Section heading (e.g. "Personal Information") at the top of every group
    sectionHeader:
      'text-sm font-semibold text-primary border-b border-primary/20 pb-2 pt-1',

    // First group in a form — no top padding
    sectionHeaderTop:
      'text-sm font-semibold text-primary border-b border-primary/20 pb-2',

    // Sub-group spacing (smaller radius, subtle background tint)
    fieldGroup: 'space-y-4',
    fieldRow:   'grid grid-cols-1 sm:grid-cols-2 gap-4',
    fieldRow3:  'grid grid-cols-1 sm:grid-cols-3 gap-4',
  },

  // ---------------------------------------------------------------------------
  // Button presets
  // ---------------------------------------------------------------------------
  button: {
    primary:   'bg-primary text-primary-foreground shadow-sm',
    primaryHover:
      'bg-primary-dark text-primary-foreground shadow-md hover:shadow-medium',
    secondary: 'bg-secondary text-secondary-foreground shadow-sm',
    secondaryHover:
      'bg-secondary/80 text-secondary-foreground',
    outline:   'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-md',
    ghost:     'hover:bg-accent hover:text-accent-foreground',
    destructive:
      'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive-dark',
    link:      'text-primary underline-offset-4 hover:underline hover:text-primary-dark',
    success:   'bg-success text-success-foreground shadow-sm hover:bg-success/85',
    warning:   'bg-warning text-warning-foreground shadow-sm hover:bg-warning/85',
    info:      'bg-info text-info-foreground shadow-sm hover:bg-info/85',
  },

  // ---------------------------------------------------------------------------
  // Badge presets
  // ---------------------------------------------------------------------------
  badge: {
    primary:
      'border-transparent bg-primary text-primary-foreground hover:bg-primary-dark',
    secondary:
      'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive:
      'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'text-foreground',
    success:
      'border-transparent bg-success text-success-foreground hover:bg-success/90',
    warning:
      'border-transparent bg-warning text-warning-foreground hover:bg-warning/90',
  },

  // ---------------------------------------------------------------------------
  // Common UI elements
  // ---------------------------------------------------------------------------
  ui: {
    card:        'bg-card rounded-xl shadow-subtle border border-border',
    input:       'border-input focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background',
    placeholder: 'text-muted-foreground',
    text: {
      primary:   'text-foreground',
      secondary: 'text-muted-foreground',
      error:     'text-destructive',
    },
    shadow: {
      subtle: 'shadow-subtle',
      medium: 'shadow-medium',
      strong: 'shadow-strong',
    },
  },

  // ---------------------------------------------------------------------------
  // Label helper
  // ---------------------------------------------------------------------------
  label:
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',

  // ---------------------------------------------------------------------------
  // Section layout helpers (used in StudentDetails sidebar cards)
  // ---------------------------------------------------------------------------
  sectionCard: {
    default:   'p-4 rounded-xl bg-card border border-border shadow-subtle',
    tinted:    'p-4 rounded-xl bg-muted/30 border border-border shadow-subtle',
    elevated:  'p-4 rounded-xl bg-card border border-border shadow-md hover:shadow-subtle transition-shadow',
    primary:   'p-4 rounded-xl bg-primary-light/10 border border-primary/20 shadow-subtle',
    success:   'p-4 rounded-xl bg-success-light/30 border border-success/20 shadow-subtle',
    destructive:'p-4 rounded-xl bg-destructive-light/30 border border-destructive/20 shadow-subtle',
  },
};