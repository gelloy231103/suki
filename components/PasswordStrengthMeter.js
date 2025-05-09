// components/PasswordStrengthMeter.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import zxcvbn from 'zxcvbn';

const strengthLevels = [
  { label: 'Very Weak', color: '#ff4d4d' },
  { label: 'Weak', color: '#ff944d' },
  { label: 'Fair', color: '#ffd11a' },
  { label: 'Good', color: '#b3ff66' },
  { label: 'Strong', color: '#33cc33' },
];

const PasswordStrengthMeter = ({ password }) => {
  const { score } = zxcvbn(password || '');
  const { label, color } = strengthLevels[score];

  return (
    <View style={styles.container}>
      <View style={[styles.barContainer]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                backgroundColor: i <= score ? color : '#e0e0e0',
              },
            ]}
          />
        ))}
      </View>
      {password.length > 0 && (
        <Text style={[styles.label, { color }]}>{label}</Text>
      )}
    </View>
  );
};

export default PasswordStrengthMeter;

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 10,
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bar: {
    height: 6,
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 4,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
  },
});
