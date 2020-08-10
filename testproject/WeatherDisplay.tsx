import React, { Component } from "react";
import { InjectedForecastResults } from "react-forecast-query";
import weatherEnhancer from "react-forecast-query";

export interface WeatherDisplayProps {
    label: string;
}

class WeatherDisplay extends Component<WeatherDisplayProps & InjectedForecastResults> {
    public render() {
        const { props } = this;
        return (
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
    }
}

export default weatherEnhancer(WeatherDisplay);