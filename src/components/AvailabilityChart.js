import React, { useState } from 'react';

const AvailabilityChart = () => {
  // Define the names, months, and initial availability data
  const names = ['Kevin', 'Dustin', 'Gilbert', 'Darwin', 'Chris', 'Nick'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Initial availability data based on the input
  // true = available, false = unavailable
  const initialAvailability = {
    'Kevin': months.map(month => !['April', 'May'].includes(month)),
    'Dustin': months.map(month => month !== 'April'),
    'Gilbert': months.map(month => true), // We'll handle specific dates separately
    'Darwin': months.map(month => true), // We'll handle specific dates separately
    'Chris': months.map(month => !['October', 'November', 'December'].includes(month)),
    'Nick': months.map(month => !['June', 'August', 'October', 'November', 'December'].includes(month))
  };
  
  // Define specific unavailable dates
  const specificDates = {
    'Gilbert': ['July 18', 'September 28', 'November 23'],
    'Darwin': ['July 4', 'August 15', 'September 19', 'September 26', 'October 24', 'November 21', 'November 28', 'December 5']
  };
  
  const [availability, setAvailability] = useState(initialAvailability);
  const [selectedMonth, setSelectedMonth] = useState(null);
  
  // Calculate the best months for the trip
  const calculateBestMonths = () => {
    const monthScores = months.map((month, index) => {
      let score = 0;
      for (const person in availability) {
        if (availability[person][index]) {
          score++;
          
          // Deduct partial points for people with specific unavailable dates in this month
          if (specificDates[person]) {
            const unavailableDatesInMonth = specificDates[person].filter(date => 
              date.includes(month)
            );
            score -= (unavailableDatesInMonth.length * 0.25); // Partial deduction for specific dates
          }
        }
      }
      return { month, score };
    });
    
    return monthScores.sort((a, b) => b.score - a.score);
  };
  
  const bestMonths = calculateBestMonths();
  
  // Get month-specific details for the selected month
  const getMonthDetails = (month) => {
    const monthIndex = months.indexOf(month);
    if (monthIndex === -1) return null;
    
    const availablePeople = names.filter(name => availability[name][monthIndex]);
    const unavailablePeople = names.filter(name => !availability[name][monthIndex]);
    
    // Check for specific date conflicts
    const specificDateConflicts = [];
    for (const person in specificDates) {
      const unavailableDatesInMonth = specificDates[person].filter(date => 
        date.includes(month)
      );
      if (unavailableDatesInMonth.length > 0) {
        specificDateConflicts.push({
          person,
          dates: unavailableDatesInMonth
        });
      }
    }
    
    return { availablePeople, unavailablePeople, specificDateConflicts };
  };
  
  const selectedMonthDetails = selectedMonth ? getMonthDetails(selectedMonth) : null;
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Boys Trip Availability Chart</h2>
      
      {/* Availability Grid */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Name</th>
              {months.map(month => (
                <th 
                  key={month} 
                  className="border border-gray-300 p-2"
                  onClick={() => setSelectedMonth(month)}
                  style={{ cursor: 'pointer' }}
                >
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {names.map(name => (
              <tr key={name}>
                <td className="border border-gray-300 p-2 font-medium">{name}</td>
                {months.map((month, index) => {
                  // Determine if there are specific date conflicts in this month
                  const hasSpecificConflicts = specificDates[name] && 
                    specificDates[name].some(date => date.includes(month));
                  
                  return (
                    <td 
                      key={`${name}-${month}`} 
                      className={`border border-gray-300 p-2 text-center ${
                        availability[name][index] 
                          ? hasSpecificConflicts 
                            ? 'bg-yellow-100' // Partially available (has specific conflicts)
                            : 'bg-green-100' // Fully available
                          : 'bg-red-100' // Unavailable
                      }`}
                    >
                      {availability[name][index] 
                        ? hasSpecificConflicts 
                          ? '⚠️' // Partially available
                          : '✓' // Available
                        : '✗' // Unavailable
                      }
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Best Months Recommendation */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Best Months for Your Trip</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {bestMonths.slice(0, 3).map(({ month, score }, index) => (
            <div 
              key={month}
              className={`p-4 rounded-lg shadow ${
                index === 0 ? 'bg-green-100 border-green-500' : 
                index === 1 ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-500'
              } border-2`}
              onClick={() => setSelectedMonth(month)}
              style={{ cursor: 'pointer' }}
            >
              <h4 className="font-bold text-lg">{index + 1}. {month}</h4>
              <p>Score: {score.toFixed(2)}/6</p>
              <p className="text-sm text-gray-600">Click for details</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Selected Month Details */}
      {selectedMonthDetails && (
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Details for {selectedMonth}</h3>
          
          <div className="mb-2">
            <span className="font-medium">Available People:</span>{' '}
            {selectedMonthDetails.availablePeople.join(', ') || 'None'}
          </div>
          
          <div className="mb-2">
            <span className="font-medium">Unavailable People:</span>{' '}
            {selectedMonthDetails.unavailablePeople.join(', ') || 'None'}
          </div>
          
          {selectedMonthDetails.specificDateConflicts.length > 0 && (
            <div>
              <span className="font-medium">Specific Date Conflicts:</span>
              <ul className="list-disc pl-6">
                {selectedMonthDetails.specificDateConflicts.map(conflict => (
                  <li key={conflict.person}>
                    {conflict.person} is unavailable on: {conflict.dates.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <button 
            className="mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            onClick={() => setSelectedMonth(null)}
          >
            Close Details
          </button>
        </div>
      )}
      
      {/* Legend */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Legend</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-green-100 mr-2 border border-gray-300"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-yellow-100 mr-2 border border-gray-300"></div>
            <span>Partially Available (specific dates unavailable)</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-red-100 mr-2 border border-gray-300"></div>
            <span>Unavailable</span>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">How to Use This Chart</h3>
        <ul className="list-disc pl-6">
          <li>Green cells (✓) indicate full availability for the month</li>
          <li>Yellow cells (⚠️) indicate partial availability (unavailable on specific dates)</li>
          <li>Red cells (✗) indicate complete unavailability for the month</li>
          <li>Click on any month in the table header to see detailed availability</li>
          <li>Click on a recommended month card to see its details</li>
        </ul>
      </div>
    </div>
  );
};

export default AvailabilityChart;