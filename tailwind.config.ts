import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: '#FF5252',
  				foreground: '#121212'
  			},
  			secondary: {
  				DEFAULT: '#77DD77',
  				foreground: '#121212'
  			},
  			destructive: {
  				DEFAULT: '#ff3b30',
  				foreground: '#FFFFFF'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: '#FFFD82',
  				foreground: '#121212'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: '#121212',
  				foreground: '#FFFFFF'
  			},
  			option: {
  				DEFAULT: '#1A1A1A',
  				selected: '#2C2C2C',
  				hover: '#252525'
  			},
  			brutalist: {
  				black: '#121212',
  				white: '#FFFFFF',
  				red: '#FF5252',
  				green: '#77DD77',
  				yellow: '#FFFD82',
  				blue: '#6495ED',
  				purple: '#CA6BE5'
  			},
  			'color-1': 'hsl(var(--color-1))',
  			'color-2': 'hsl(var(--color-2))',
  			'color-3': 'hsl(var(--color-3))',
  			'color-4': 'hsl(var(--color-4))',
  			'color-5': 'hsl(var(--color-5))'
  		},
  		boxShadow: {
  			brutal: '5px 5px 0px 0px #121212',
  			'brutal-hover': '7px 7px 0px 0px #121212',
  			'brutal-sm': '3px 3px 0px 0px #121212'
  		},
  		keyframes: {
  			'fade-in': {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			'fade-up': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			wriggle: {
  				'0%, 100%': {
  					transform: 'rotate(-1deg)'
  				},
  				'50%': {
  					transform: 'rotate(1deg)'
  				}
  			},
  			'shimmer-slide': {
  				to: {
  					transform: 'translate(calc(100cqw - 100%), 0)'
  				}
  			},
  			'spin-around': {
  				'0%': {
  					transform: 'translateZ(0) rotate(0)'
  				},
  				'15%, 35%': {
  					transform: 'translateZ(0) rotate(90deg)'
  				},
  				'65%, 85%': {
  					transform: 'translateZ(0) rotate(270deg)'
  				},
  				'100%': {
  					transform: 'translateZ(0) rotate(360deg)'
  				}
  			},
  			rainbow: {
  				'0%': {
  					'background-position': '0%'
  				},
  				'100%': {
  					'background-position': '200%'
  				}
  			}
  		},
  		animation: {
  			'fade-in': 'fade-in 0.5s ease-out',
  			'fade-up': 'fade-up 0.5s ease-out',
  			wriggle: 'wriggle 0.5s ease-in-out infinite',
  			'shimmer-slide': 'shimmer-slide var(--speed) ease-in-out infinite alternate',
  			'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
  			rainbow: 'rainbow var(--speed, 2s) infinite linear'
  		},
  		fontFamily: {
  			gascogne: [
  				'Gascogne',
  				'sans-serif'
  			],
  			manrope: [
  				'Manrope',
  				'sans-serif'
  			],
  			mono: [
  				'monospace'
  			]
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
