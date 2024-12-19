export function formatExecutionTime(timeInMs) {
    if (timeInMs < 0.001) {
        const timeInNs = timeInMs * 1000000;
        return `${timeInNs.toFixed(0)}ns`;
    } else if (timeInMs < 1) {
        const timeInUs = timeInMs * 1000;
        return `${timeInUs.toFixed(1)}µs`;
    } else if (timeInMs < 1000) {
        return `${timeInMs.toFixed(2)}ms`;
    } else {
        return `${(timeInMs / 1000).toFixed(2)}s`;
    }
}

export function formatTimeEstimate(seconds) {
    if (seconds < 1) return 'less than a second';
    
    const timeUnits = [
        { unit: 'millennium', plural: 'millennia', seconds: 31557600000 },
        { unit: 'century', plural: 'centuries', seconds: 3155760000 },
        { unit: 'decade', plural: 'decades', seconds: 315576000 },
        { unit: 'year', plural: 'years', seconds: 31557600 },
        { unit: 'month', plural: 'months', seconds: 2629800 },
        { unit: 'week', plural: 'weeks', seconds: 604800 },
        { unit: 'day', plural: 'days', seconds: 86400 },
        { unit: 'hour', plural: 'hours', seconds: 3600 },
        { unit: 'minute', plural: 'minutes', seconds: 60 },
        { unit: 'second', plural: 'seconds', seconds: 1 }
    ];

    // Find the two largest applicable units
    let primaryUnit = timeUnits.find(unit => seconds >= unit.seconds);
    if (!primaryUnit) return 'less than a second';

    const primaryValue = Math.floor(seconds / primaryUnit.seconds);
    const remainingSeconds = seconds % primaryUnit.seconds;

    // Find the next unit down that has a value
    const secondaryUnit = timeUnits.find(unit => 
        unit.seconds < primaryUnit.seconds && remainingSeconds >= unit.seconds
    );

    let timeString = `${primaryValue} ${primaryValue === 1 ? primaryUnit.unit : primaryUnit.plural}`;
    
    if (secondaryUnit) {
        const secondaryValue = Math.floor(remainingSeconds / secondaryUnit.seconds);
        if (secondaryValue > 0) {
            timeString += ` and ${secondaryValue} ${secondaryValue === 1 ? secondaryUnit.unit : secondaryUnit.plural}`;
        }
    }

    return timeString;
} 