import React from "react";
import WeatherDisplay from "./WeatherDisplay";
import ReactDOM from "react-dom";

interface State {
    value: string;
    apiKey: string;
}

class TestWeather extends React.Component<{}, State> {
    state: State = {
        value: '',
        apiKey: '',
    }
    public render() {
        const { state } = this;
        const today = new Date();
        const fourDaysFromNow = new Date();
        fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 4);
        return (
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
        );
    }
}

ReactDOM.render(
    <TestWeather />,
    document.getElementById("root"),
);