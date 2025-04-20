export type Theme = {
  name: string;
  mode: 'dark' | 'light';
  colors: {
    // Global colors
    primary: string;
    secondary: string;
    accent: string;
    accent2: string;
    textPrimary: string;
    textSecondary: string;
    background: string;
    text: string;
    card: string;
    border: string;
    error: string;
    
    // Common components
    common?: {
      button: {
        primary: string;
        secondary: string;
        disabled: string;
        text: string;
      };
      input: {
        background: string;
        border: string;
        text: string;
        placeholder: string;
        focus: string;
      };
      modal: {
        background: string;
        overlay: string;
        header: string;
        content: string;
      };
      toast: {
        success: string;
        error: string;
        info: string;
        warning: string;
        text: string;
      };
      icon: {
        active: string;
        inactive: string;
      };
    };
    
    // Dashboard page theming
    dashboard?: {
      // Header section
      header: {
        background: string;
        text: string;
        icon: string;
      };
      // Stats cards
      stats: {
        background: string;
        border: string;
        text: string;
        icon: string;
      };
      // Workout items
      workout: {
        card: {
          background: string;
          activeBackground: string;
          border: string;
          completedBorder: string;
        };
        title: string;
        subtitle: string;
        icon: string;
        progressBar: {
          background: string;
          fill: string;
          text: string;
        };
        button: {
          complete: string;
          reset: string;
          edit: string;
          text: string;
        };
      };
      // Achievement section
      achievement: {
        badge: string;
        text: string;
        icon: string;
        background: string;
      };
      // Daily summary
      summary: {
        background: string;
        text: string;
        highlight: string;
      };
      // Add metallic background properties
      background: {
        base: string;
        gradient: {
          start: string;
          middle: string;
          end: string;
        };
        highlight: string;
        shadow: string;
        metallic: boolean; // Flag to indicate metallic style should be applied
      };
    };
    
    // Workouts page theming
    workouts?: {
      // Category section
      category: {
        card: {
          background: string;
          activeBackground: string;
          border: string;
        };
        title: string;
        icon: string;
      };
      // Exercise items
      exercise: {
        card: {
          background: string;
          activeBackground: string;
          completedBackground: string;
          border: string;
        };
        title: string;
        subtitle: string;
        metric: string;
        icon: string;
      };
      // Workout modal
      modal: {
        background: string;
        header: string;
        content: string;
        input: {
          background: string;
          border: string;
          text: string;
        };
        button: {
          primary: string;
          cancel: string;
          text: string;
        };
      };
      // Intensity indicators
      intensity: {
        low: string;
        medium: string;
        high: string;
        text: string;
      };
      // History section
      history: {
        background: string;
        item: {
          background: string;
          border: string;
          text: string;
        };
        date: string;
        value: string;
      };
    };
    
    // Profile page theming
    profile?: {
      // Header section
      header: {
        background: string;
        text: string;
        subtext: string;
      };
      // User card
      userCard: {
        background: string;
        border: string;
        username: string;
        bio: string;
      };
      // Stats display
      stats: {
        card: {
          background: string;
          border: string;
        };
        label: string;
        value: string;
        icon: string;
      };
      // Level badge
      level: {
        badge: {
          background: string;
          border: string;
        };
        text: string;
        progressBar: {
          background: string;
          fill: string;
          text: string;
        };
      };
      // Achievements
      achievement: {
        card: {
          background: string;
          border: string;
          lockedBackground: string;
        };
        title: string;
        description: string;
        icon: {
          unlocked: string;
          locked: string;
        };
      };
      // Workout history
      history: {
        card: {
          background: string;
          border: string;
        };
        item: {
          background: string;
          text: string;
          value: string;
          date: string;
        };
        chart: {
          line: string;
          point: string;
          grid: string;
          label: string;
        };
      };
      // Settings section
      settings: {
        card: {
          background: string;
          border: string;
        };
        item: {
          background: string;
          activeBackground: string;
          text: string;
          icon: string;
        };
        switch: {
          track: {
            active: string;
            inactive: string;
          };
          thumb: {
            active: string;
            inactive: string;
          };
        };
      };
    };
    
    // Leaderboard page theming
    leaderboard?: {
      // Header section
      header: {
        background: string;
        title: string;
        subtitle: string;
      };
      // Filters section
      filters: {
        background: string;
        border: string;
        text: string;
        activeText: string;
        icon: string;
        dropdown: {
          background: string;
          border: string;
          text: string;
          selectedBackground: string;
        };
      };
      // Podium display for top 3
      podium: {
        background: string;
        firstPlace: {
          background: string;
          accent: string;
          text: string;
        };
        secondPlace: {
          background: string;
          accent: string;
          text: string;
        };
        thirdPlace: {
          background: string;
          accent: string;
          text: string;
        };
      };
      // Leaderboard items
      rankCard: {
        background: string;
        border: string;
        activeBackground: string;
        username: string;
        stats: string;
        rank: {
          background: string;
          text: string;
        };
        progressBar: {
          background: string;
          fill: string;
          text: string;
        };
        followButton: {
          active: string;
          inactive: string;
          text: string;
        };
      };
      // User highlight (current user)
      userHighlight: {
        background: string;
        border: string;
        text: string;
      };
    };
    
    // Explore page theming
    explore?: {
      // Map section
      map: {
        marker: string;
        userMarker: string;
        callout: {
          background: string;
          border: string;
          text: string;
        };
        cluster: {
          background: string;
          text: string;
        };
      };
      // Gym card
      gymCard: {
        background: string;
        border: string;
        title: string;
        info: string;
        distance: string;
      };
      // Search and filters
      search: {
        background: string;
        text: string;
        icon: string;
        filter: {
          background: string;
          activeBackground: string;
          text: string;
          activeText: string;
        };
      };
      // Ratings
      rating: {
        filled: string;
        empty: string;
        text: string;
      };
      // Details modal
      details: {
        background: string;
        header: string;
        section: {
          title: string;
          content: string;
        };
        button: {
          primary: string;
          secondary: string;
          text: string;
        };
      };
    };
    
    // Auth pages theming
    auth?: {
      // Login page
      login: {
        background: string;
        card: {
          background: string;
          border: string;
        };
        title: string;
        input: {
          background: string;
          border: string;
          text: string;
          placeholder: string;
        };
        button: {
          background: string;
          text: string;
        };
        link: string;
        error: string;
      };
      // Registration page
      signup: {
        background: string;
        card: {
          background: string;
          border: string;
        };
        title: string;
        input: {
          background: string;
          border: string;
          text: string;
          placeholder: string;
        };
        button: {
          background: string;
          text: string;
        };
        link: string;
        error: string;
      };
      // Onboarding screens
      onboarding: {
        background: string;
        title: string;
        text: string;
        dot: {
          active: string;
          inactive: string;
        };
        button: {
          background: string;
          text: string;
        };
      };
    };
  };
};

// Dark Themes
const darkThemes: Record<string, Theme> = {
  'Solo Leveling': {
    name: 'Solo Leveling',
    mode: 'dark',
    colors: {
      primary: '#190019',
      secondary: '#9054df',
      accent: '#e985ff',
      accent2: '#854F6C',
      textPrimary: '#FBE4D8',
      textSecondary: '#DFB6B2',
      background: '#190019',
      text: '#FBE4D8',
      card: '#9054df',
      border: '#e985ff',
      error: '#FF4444',
    },
  },
  'Dragon Ball': {
    name: 'Dragon Ball',
    mode: 'dark',
    colors: {
      primary: '#0A0A23',
      secondary: '#FF8C00',
      accent: '#E63946',
      accent2: '#FFC300',
      textPrimary: '#F1FAEE',
      textSecondary: '#457B9D',
      background: '#0A0A23',
      text: '#F1FAEE',
      card: '#1A1A40',
      border: '#E63946',
      error: '#FF4444',
    },
  },
  'One Punch': {
    name: 'One Punch',
    mode: 'dark',
    colors: {
      primary: '#1A1A1A',
      secondary: '#F9D342',
      accent: '#FF4500',
      accent2: '#EFEFEF',
      textPrimary: '#FFFFFF',
      textSecondary: '#DC143C',
      background: '#1A1A1A',
      text: '#FFFFFF',
      card: '#2A2A2A',
      border: '#FF4500',
      error: '#FF4444',
    },
  },
  'Baki': {
    name: 'Baki',
    mode: 'dark',
    colors: {
      primary: '#101010',
      secondary: '#FF7043',
      accent: '#D32F2F',
      accent2: '#FFCCBC',
      textPrimary: '#FFFFFF',
      textSecondary: '#E0E0E0',
      background: '#101010',
      text: '#FFFFFF',
      card: '#202020',
      border: '#FF7043',
      error: '#FF4444',
    },
  },
  'Attack on Titan': {
    name: 'Attack on Titan',
    mode: 'dark',
    colors: {
      primary: '#0C2E3F',
      secondary: '#556B2F',
      accent: '#C0392B',
      accent2: '#D35400',
      textPrimary: '#ECF0F1',
      textSecondary: '#7F8C8D',
      background: '#0C2E3F',
      text: '#ECF0F1',
      card: '#34495E',
      border: '#C0392B',
      error: '#FF4444',
    },
  },
  'One Piece': {
    name: 'One Piece',
    mode: 'dark',
    colors: {
      primary: '#001F3F',
      secondary: '#27AE60',
      accent: '#E67E22',
      accent2: '#F39C12',
      textPrimary: '#FDFEFE',
      textSecondary: '#FFFFFF',
      background: '#001F3F',
      text: '#FDFEFE',
      card: '#002F5F',
      border: '#27AE60',
      error: '#FF4444',
    },
  },
  'Jujutsu Kaisen': {
    name: 'Jujutsu Kaisen',
    mode: 'dark',
    colors: {
      primary: '#1C1C1C',
      secondary: '#0077B6',
      accent: '#9B59B6',
      accent2: '#D2B4DE',
      textPrimary: '#ECF0F1',
      textSecondary: '#FFFFFF',
      background: '#1C1C1C',
      text: '#ECF0F1',
      card: '#2C2C2C',
      border: '#9B59B6',
      error: '#FF4444',
    },
  },
  'Black Clover': {
    name: 'Black Clover',
    mode: 'dark',
    colors: {
      primary: '#1A1A1A',
      secondary: '#000000',
      accent: '#F1C40F',
      accent2: '#8E44AD',
      textPrimary: '#EAECEE',
      textSecondary: '#D4AC0D',
      background: '#1A1A1A',
      text: '#EAECEE',
      card: '#2A2A2A',
      border: '#F1C40F',
      error: '#FF4444',
    },
  },
  'Naruto': {
    name: 'Naruto',
    mode: 'dark',
    colors: {
      primary: '#0B0C10',
      secondary: '#FF4136',
      accent: '#2980B9',
      accent2: '#FF851B',
      textPrimary: '#FDFEFE',
      textSecondary: '#FFDC00',
      background: '#0B0C10',
      text: '#FDFEFE',
      card: '#1B1C20',
      border: '#2980B9',
      error: '#FF4444',
    },
  },
};

// Light Themes
const lightThemes: Record<string, Theme> = {
  'Hajime no Ippo': {
    name: 'Hajime no Ippo',
    mode: 'light',
    colors: {
      primary: '#FFFFFF',
      secondary: '#0D47A1', // Deeper blue for better contrast on mobile
      accent: '#FFC107',    // Champion belt gold
      accent2: '#2E7D32',   // Darker Kamogawa gym green
      textPrimary: '#0D47A1',
      textSecondary: '#2E7D32',
      background: '#F5F5F5', // Light gray background reduces eye strain
      text: '#0D47A1',
      card: '#E3F2FD',
      border: '#0D47A1',    // Stronger border for better visibility
      error: '#C62828',
    },
  },
  'Megalo Box': {
    name: 'Megalo Box',
    mode: 'light',
    colors: {
      // Global colors
      primary: '#FFFFFF',
      secondary: '#455A64', // Darker steel blue for contrast
      accent: '#E53935',    // Changed from amber (#FF8F00) to red
      accent2: '#B71C1C',   // Changed from orange (#BF360C) to darker red
      textPrimary: '#263238',
      textSecondary: '#37474F',
      background: '#ECEFF1', // Light bluish-gray background
      text: '#263238',
      card: '#FFEBEE',      // Changed from light blue to light red
      border: '#455A64',    // Kept for better visibility
      error: '#C62828',     // Darker red error
      
      // Common components
      common: {
        button: {
          primary: '#E53935',
          secondary: '#455A64',
          disabled: '#B0BEC5',
          text: '#FFFFFF',
        },
        input: {
          background: '#FFFFFF',
          border: '#CFD8DC',
          text: '#263238',
          placeholder: '#90A4AE',
          focus: '#E53935',
        },
        modal: {
          background: '#FFFFFF',
          overlay: 'rgba(38, 50, 56, 0.7)',
          header: '#ECEFF1',
          content: '#FFFFFF',
        },
        toast: {
          success: '#43A047',
          error: '#E53935',
          info: '#1E88E5',
          warning: '#FB8C00',
          text: '#FFFFFF',
        },
        icon: {
          active: '#E53935',
          inactive: '#90A4AE',
        },
      },
      
      // Dashboard page theming
      dashboard: {
        header: {
          background: '#ECEFF1',
          text: '#263238',
          icon: '#E53935',
        },
        // Add metallic background properties
        background: {
          base: '#E0E3E7',
          gradient: {
            start: '#C9D6DF',
            middle: '#E0E3E7',
            end: '#D3D4D8',
          },
          highlight: '#F5F5F7',
          shadow: '#B8B9BE',
          metallic: true, // Flag to indicate metallic style should be applied
        },
        stats: {
          background: '#CFD8DC',
          border: '#B0BEC5',
          text: '#263238',
          icon: '#E53935',
        },
        workout: {
          card: {
            background: '#FFFFFF',
            activeBackground: '#FFEBEE',
            border: '#CFD8DC',
            completedBorder: '#E53935',
          },
          title: '#263238',
          subtitle: '#455A64',
          icon: '#E53935',
          progressBar: {
            background: '#FFCDD2',
            fill: '#E53935',
            text: '#263238',
          },
          button: {
            complete: '#E53935',
            reset: '#455A64',
            edit: '#455A64',
            text: '#FFFFFF',
          },
        },
        achievement: {
          badge: '#B71C1C',
          text: '#263238',
          icon: '#E53935',
          background: '#FFEBEE',
        },
        summary: {
          background: '#ECEFF1',
          text: '#263238',
          highlight: '#E53935',
        },
      },
      
      // Workouts page theming
      workouts: {
        category: {
          card: {
            background: '#ECEFF1',
            activeBackground: '#FFEBEE',
            border: '#CFD8DC',
          },
          title: '#263238',
          icon: '#E53935',
        },
        exercise: {
          card: {
            background: '#FFFFFF',
            activeBackground: '#FFEBEE',
            completedBackground: '#EDF8F6',
            border: '#CFD8DC',
          },
          title: '#263238',
          subtitle: '#455A64',
          metric: '#455A64',
          icon: '#E53935',
        },
        modal: {
          background: '#FFFFFF',
          header: '#ECEFF1',
          content: '#FFFFFF',
          input: {
            background: '#F5F5F5',
            border: '#CFD8DC',
            text: '#263238',
          },
          button: {
            primary: '#E53935',
            cancel: '#455A64',
            text: '#FFFFFF',
          },
        },
        intensity: {
          low: '#90A4AE',
          medium: '#E53935',
          high: '#B71C1C',
          text: '#FFFFFF',
        },
        history: {
          background: '#ECEFF1',
          item: {
            background: '#FFFFFF',
            border: '#CFD8DC',
            text: '#263238',
          },
          date: '#455A64',
          value: '#E53935',
        },
      },
      
      // Profile page theming
      profile: {
        header: {
          background: '#ECEFF1',
          text: '#263238',
          subtext: '#455A64',
        },
        userCard: {
          background: '#FFFFFF',
          border: '#CFD8DC',
          username: '#263238',
          bio: '#455A64',
        },
        stats: {
          card: {
            background: '#CFD8DC',
            border: '#B0BEC5',
          },
          label: '#455A64',
          value: '#263238',
          icon: '#E53935',
        },
        level: {
          badge: {
            background: '#E53935',
            border: '#B71C1C',
          },
          text: '#FFFFFF',
          progressBar: {
            background: '#FFCDD2',
            fill: '#E53935',
            text: '#263238',
          },
        },
        achievement: {
          card: {
            background: '#ECEFF1',
            border: '#CFD8DC',
            lockedBackground: '#ECEFF1',
          },
          title: '#263238',
          description: '#455A64',
          icon: {
            unlocked: '#E53935',
            locked: '#90A4AE',
          },
        },
        history: {
          card: {
            background: '#FFEBEE',
            border: '#FFCDD2',
          },
          item: {
            background: '#FFFFFF',
            text: '#263238',
            value: '#E53935',
            date: '#455A64',
          },
          chart: {
            line: '#E53935',
            point: '#B71C1C',
            grid: '#CFD8DC',
            label: '#455A64',
          },
        },
        settings: {
          card: {
            background: '#ECEFF1',
            border: '#CFD8DC',
          },
          item: {
            background: '#FFFFFF',
            activeBackground: '#FFEBEE',
            text: '#263238',
            icon: '#E53935',
          },
          switch: {
            track: {
              active: '#FFCDD2',
              inactive: '#CFD8DC',
            },
            thumb: {
              active: '#E53935',
              inactive: '#90A4AE',
            },
          },
        },
      },
      
      // Leaderboard page theming
      leaderboard: {
        header: {
          background: '#ECEFF1',
          title: '#263238',
          subtitle: '#455A64',
        },
        filters: {
          background: '#FFFFFF',
          border: '#CFD8DC',
          text: '#455A64',
          activeText: '#E53935',
          icon: '#E53935',
          dropdown: {
            background: '#FFFFFF',
            border: '#CFD8DC',
            text: '#263238',
            selectedBackground: '#FFEBEE',
          },
        },
        podium: {
          background: '#ECEFF1',
          firstPlace: {
            background: '#FFF8E1',
            accent: '#FFEB3B',
            text: '#263238',
          },
          secondPlace: {
            background: '#F5F5F5',
            accent: '#B0BEC5',
            text: '#263238',
          },
          thirdPlace: {
            background: '#FBE9E7',
            accent: '#BF8970',
            text: '#263238',
          },
        },
        rankCard: {
          background: '#CFD8DC',
          border: '#B0BEC5',
          activeBackground: '#FFEBEE',
          username: '#263238',
          stats: '#455A64',
          rank: {
            background: '#E53935',
            text: '#FFFFFF',
          },
          progressBar: {
            background: '#FFFFFF',
            fill: '#E53935',
            text: '#263238',
          },
          followButton: {
            active: '#B0BEC5',
            inactive: '#E53935',
            text: '#FFFFFF',
          },
        },
        userHighlight: {
          background: '#FFEBEE',
          border: '#E53935',
          text: '#263238',
        },
      },
      
      // Explore page theming
      explore: {
        map: {
          marker: '#E53935',
          userMarker: '#1976D2',
          callout: {
            background: '#FFFFFF',
            border: '#CFD8DC',
            text: '#263238',
          },
          cluster: {
            background: '#E53935',
            text: '#FFFFFF',
          },
        },
        gymCard: {
          background: '#ECEFF1',
          border: '#CFD8DC',
          title: '#263238',
          info: '#455A64',
          distance: '#E53935',
        },
        search: {
          background: '#FFFFFF',
          text: '#263238',
          icon: '#455A64',
          filter: {
            background: '#ECEFF1',
            activeBackground: '#FFEBEE',
            text: '#455A64',
            activeText: '#E53935',
          },
        },
        rating: {
          filled: '#FFB300',
          empty: '#CFD8DC',
          text: '#263238',
        },
        details: {
          background: '#FFFFFF',
          header: '#ECEFF1',
          section: {
            title: '#263238',
            content: '#455A64',
          },
          button: {
            primary: '#E53935',
            secondary: '#455A64',
            text: '#FFFFFF',
          },
        },
      },
      
      // Auth pages theming
      auth: {
        login: {
          background: '#ECEFF1',
          card: {
            background: '#FFFFFF',
            border: '#CFD8DC',
          },
          title: '#263238',
          input: {
            background: '#F5F5F5',
            border: '#CFD8DC',
            text: '#263238',
            placeholder: '#90A4AE',
          },
          button: {
            background: '#E53935',
            text: '#FFFFFF',
          },
          link: '#455A64',
          error: '#E53935',
        },
        signup: {
          background: '#ECEFF1',
          card: {
            background: '#FFFFFF',
            border: '#CFD8DC',
          },
          title: '#263238',
          input: {
            background: '#F5F5F5',
            border: '#CFD8DC',
            text: '#263238',
            placeholder: '#90A4AE',
          },
          button: {
            background: '#E53935',
            text: '#FFFFFF',
          },
          link: '#455A64',
          error: '#E53935',
        },
        onboarding: {
          background: '#FFFFFF',
          title: '#263238',
          text: '#455A64',
          dot: {
            active: '#E53935',
            inactive: '#CFD8DC',
          },
          button: {
            background: '#E53935',
            text: '#FFFFFF',
          },
        },
      },
    },
  },
};

// Combine dark and light themes
export const themes: Record<string, Theme> = {
  ...darkThemes,
  ...lightThemes,
}; 