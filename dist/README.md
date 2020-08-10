# react-forecast-query

A simple higher order component capable of injecting weather information from open weather api into a component

## Example of use

```JSX
<div>
    <input value={state.value} onInput={e => this.setState({ value: (e.target as HTMLInputElement).value })} />
    <button onClick={() => this.setState(prevState => ({ apiKey: prevState.value }))}>Test component</button>
    {state.apiKey && (
        <WeatherDisplay 
            apiKey={state.apiKey}
            label="Cloudy weather measurements"
            query={['clouds', 'cloudy']}
            by="hour"
            loadingComponent={() => <div>Loading...</div>}
            setup={forecast => forecast
                .at(today, fourDaysFromNow)
                .around(50.08804, 14.42076)
                .units('metric')
                .language('cz')}
        />
    )}
</div>
```

## Example of how to define injected component

```JSX

import React, { FunctionComponent } from "react";
import { InjectedForecastResults } from "react-forecast-query";
import weatherEnhancer from "react-forecast-query";

export interface WeatherDisplayProps {
    label: string;
}

const WeatherDisplay: FunctionComponent<WeatherDisplayProps & InjectedForecastResults> = props => (
    <section>
        <label>{props.label}</label>
        <ul>
            {props.data.clouds?.map(clouds => (
                <li>
                    {clouds.date.toDateString()} {clouds.date.toTimeString()} - {clouds.value}
                </li>
            ))}
        </ul>
        <ul>
            {props.data.cloudy?.map(weather => (
                <li>
                    <img src={props.forecast.icon(weather.icon)} />
                    <div>
                        {weather.description}
                    </div>
                </li>
            ))}
        </ul>
    </section>
);

export default weatherEnhancer(WeatherDisplay);

```

## Use of the component

Use setup props to add location, units, language and dates, then define a string list of information you want to receive.


List of information is derived from ".list()" function in forecast-query.


"By" parameter refers to how descriptive the list should be ("hour" delivers hourly weather updates, "day" daily ones).


"loadingComponent" will display whatever component you want when the api is loading information.

## Changes since 0.1.0

Added error component

## Changes since 0.1.1

Fix error component error reporting

## Changes since 0.2.0

Add support for gps geolocation in browser.

### Example of use

```JSX

<WeatherDisplay 
    apiKey={state.apiKey}
    label="Cloudy weather measurements"
    query={['clouds', 'cloudy']}
    by="hour"
    loadingComponent={() => <div>Loading...</div>}
    errorComponent={props => {
        console.error(props.error);
        return <div>Error!</div>
    }}
    geo // Try and get geolocation
    updateGeo={1} // Updates every minute
    setup={forecast => forecast
        .at(today, fourDaysFromNow)
        .units('metric') // No location setup needed
        .language('cz')}
/>

```

## Changes since 0.2.1

Fixed a bug in typing of enhancer concerning Component class.

## More information

For more information about weather prediction from open weather api please visit: https://www.npmjs.com/package/forecast-query


If you find any bug or have an idea of how to improve this package, please file in an issue or a pull request