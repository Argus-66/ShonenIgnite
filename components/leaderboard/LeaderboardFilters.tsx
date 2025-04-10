import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { RankingLevel, TimePeriod } from '@/hooks/useLeaderboard';

interface LeaderboardFiltersProps {
  currentRankingLevel: RankingLevel;
  currentTimePeriod: TimePeriod;
  onRankingLevelChange: (level: RankingLevel) => void;
  onTimePeriodChange: (period: TimePeriod) => void;
  currentUserLocation: {country: string, continent: string, region: string} | null;
  onCountryChange?: (country: string) => void;
  onContinentChange?: (continent: string) => void;
  selectedCountry?: string | null;
  selectedContinent?: string | null;
}

export const LeaderboardFilters = ({
  currentRankingLevel,
  currentTimePeriod,
  onRankingLevelChange,
  onTimePeriodChange,
  currentUserLocation,
  onCountryChange,
  onContinentChange,
  selectedCountry,
  selectedContinent
}: LeaderboardFiltersProps) => {
  const { currentTheme } = useTheme();
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [showContinentSelector, setShowContinentSelector] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  
  // More comprehensive list of countries
  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 
    'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 
    'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 
    'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 
    'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 
    'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 
    'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 
    'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 
    'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 
    'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 
    'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 
    'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 
    'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 
    'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 
    'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 
    'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 
    'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 
    'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 
    'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 
    'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 
    'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 
    'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 
    'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 
    'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 
    'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 
    'Zambia', 'Zimbabwe'
  ];
  
  const continents = [
    'North America', 'South America', 'Europe', 'Asia', 
    'Africa', 'Oceania', 'Antarctica'
  ];

  // Filter countries based on search query
  useEffect(() => {
    if (countrySearch.trim() === '') {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter(country => 
        country.toLowerCase().includes(countrySearch.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [countrySearch]);

  const rankingLevels: { key: RankingLevel; label: string; icon: string }[] = [
    { key: 'global', label: 'Global', icon: 'earth' },
    { key: 'continental', label: 'Continental', icon: 'map' },
    { key: 'country', label: 'Country', icon: 'flag' },
    { key: 'regional', label: 'Regional', icon: 'map-marker-radius' },
    { key: 'followers', label: 'Followers', icon: 'account-group' },
  ];

  const timePeriods: { key: TimePeriod; label: string; icon: string }[] = [
    { key: 'overall', label: 'All Time', icon: 'calendar' },
    { key: 'monthly', label: 'This Month', icon: 'calendar-month' },
    { key: 'weekly', label: 'This Week', icon: 'calendar-week' },
    { key: 'daily', label: 'Today', icon: 'calendar-today' },
  ];

  // Get appropriate label for the ranking button
  const getRankingButtonLabel = (level: { key: RankingLevel; label: string; icon: string }) => {
    if (level.key === 'continental' && currentRankingLevel === 'continental') {
      return selectedContinent || 'Select Continent';
    } else if (level.key === 'country' && currentRankingLevel === 'country') {
      return selectedCountry || 'Select Country';
    } else {
      return level.label;
    }
  };

  return (
    <View style={styles.container}>
      {/* Ranking Level Selector */}
      <View style={styles.selectorContainer}>
        <ThemedText style={styles.selectorLabel}>Ranking:</ThemedText>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {rankingLevels.map(level => {
            const isSelected = currentRankingLevel === level.key;
            const needsSelector = (level.key === 'continental' || level.key === 'country') && isSelected;
            const buttonLabel = getRankingButtonLabel(level);
            
            return (
              <TouchableOpacity
                key={level.key}
                style={[
                  styles.filterButton,
                  isSelected && { 
                    backgroundColor: `${currentTheme.colors.accent}30`,
                    borderColor: currentTheme.colors.accent,
                    borderWidth: 1.5
                  },
                  needsSelector && { paddingRight: 8, minWidth: 130 }
                ]}
                onPress={() => {
                  onRankingLevelChange(level.key);
                  
                  // Open selector automatically when switching to continent/country
                  if (level.key === 'continental' && !selectedContinent) {
                    setTimeout(() => setShowContinentSelector(true), 300);
                  } else if (level.key === 'country' && !selectedCountry) {
                    setTimeout(() => {
                      setCountrySearch('');
                      setFilteredCountries(countries);
                      setShowCountrySelector(true);
                    }, 300);
                  }
                }}
              >
                <MaterialCommunityIcons 
                  name={level.icon as any} 
                  size={18}
                  color={isSelected ? currentTheme.colors.accent : currentTheme.colors.text}
                />
                
                {needsSelector ? (
                  <View style={styles.selectorButton}>
                    <ThemedText 
                      style={[
                        styles.buttonText,
                        isSelected && { color: currentTheme.colors.accent, fontWeight: '600' },
                        { flex: 1 }
                      ]}
                      numberOfLines={1}
                    >
                      {buttonLabel}
                    </ThemedText>
                    <TouchableOpacity
                      onPress={() => {
                        if (level.key === 'continental') {
                          setShowContinentSelector(true);
                        } else if (level.key === 'country') {
                          setCountrySearch('');
                          setFilteredCountries(countries);
                          setShowCountrySelector(true);
                        }
                      }}
                    >
                      <MaterialCommunityIcons 
                        name="chevron-down" 
                        size={18}
                        color={isSelected ? currentTheme.colors.accent : currentTheme.colors.text}
                        style={styles.chevron}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <ThemedText 
                    style={[
                      styles.buttonText,
                      isSelected && { color: currentTheme.colors.accent, fontWeight: '600' }
                    ]}
                  >
                    {buttonLabel}
                  </ThemedText>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      
      {/* Time Period Selector */}
      <View style={styles.selectorContainer}>
        <ThemedText style={styles.selectorLabel}>Period:</ThemedText>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {timePeriods.map(period => {
            const isSelected = currentTimePeriod === period.key;
            
            return (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.filterButton,
                  isSelected && { 
                    backgroundColor: `${currentTheme.colors.accent}30`,
                    borderColor: currentTheme.colors.accent,
                    borderWidth: 1.5
                  }
                ]}
                onPress={() => onTimePeriodChange(period.key)}
              >
                <MaterialCommunityIcons 
                  name={period.icon as any} 
                  size={18}
                  color={isSelected ? currentTheme.colors.accent : currentTheme.colors.text}
                />
                <ThemedText 
                  style={[
                    styles.buttonText,
                    isSelected && { color: currentTheme.colors.accent, fontWeight: '600' }
                  ]}
                >
                  {period.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      
      {/* Country Selector Modal */}
      <Modal
        visible={showCountrySelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountrySelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: currentTheme.colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Country</ThemedText>
              <TouchableOpacity onPress={() => setShowCountrySelector(false)}>
                <MaterialCommunityIcons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color={currentTheme.colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={[
                  styles.searchInput,
                  { color: currentTheme.colors.text }
                ]}
                placeholder="Search countries..."
                placeholderTextColor={currentTheme.colors.textSecondary}
                value={countrySearch}
                onChangeText={setCountrySearch}
              />
              {countrySearch.length > 0 && (
                <TouchableOpacity
                  onPress={() => setCountrySearch('')}
                  style={styles.clearSearch}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={16}
                    color={currentTheme.colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
            
            {filteredCountries.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={40}
                  color={currentTheme.colors.textSecondary}
                />
                <ThemedText style={styles.noResultsText}>
                  No countries found matching "{countrySearch}"
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={filteredCountries}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      selectedCountry === item && { backgroundColor: `${currentTheme.colors.accent}20` }
                    ]}
                    onPress={() => {
                      if (onCountryChange) onCountryChange(item);
                      setShowCountrySelector(false);
                    }}
                  >
                    <ThemedText>{item}</ThemedText>
                    {selectedCountry === item && (
                      <MaterialCommunityIcons name="check" size={18} color={currentTheme.colors.accent} />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
      
      {/* Continent Selector Modal */}
      <Modal
        visible={showContinentSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowContinentSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: currentTheme.colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Continent</ThemedText>
              <TouchableOpacity onPress={() => setShowContinentSelector(false)}>
                <MaterialCommunityIcons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={continents}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    selectedContinent === item && { backgroundColor: `${currentTheme.colors.accent}20` }
                  ]}
                  onPress={() => {
                    if (onContinentChange) onContinentChange(item);
                    setShowContinentSelector(false);
                  }}
                >
                  <ThemedText>{item}</ThemedText>
                  {selectedContinent === item && (
                    <MaterialCommunityIcons name="check" size={18} color={currentTheme.colors.accent} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
    width: 75,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingRight: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  buttonText: {
    fontSize: 14,
    marginLeft: 6,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 6,
  },
  chevron: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearSearch: {
    padding: 4,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  noResultsContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    marginTop: 10,
    textAlign: 'center',
    opacity: 0.7,
  }
}); 