import { ForecastList, Forecast, Locator } from 'forecast-query/types';
import forecast from 'forecast-query';
import React from 'react';

type ForecastResults = { [K in keyof ForecastList]?: ForecastList[K] extends () => Promise<infer U> ? U : never };

export interface InjectedForecastResults { 
    data: ForecastResults;
    forecast: Forecast;
}

export interface InjectedForecastProps {
    apiKey: string,
    query: Array<keyof ForecastList>,
    isPro?: boolean,
    by?: 'day' | 'hour',
    setup?: (forecast: Forecast) => void,
    loadingComponent?: () => JSX.Element | null,
    errorComponent?: (props: { error: any }) => JSX.Element | null
}

interface ForecastEnhancerProps extends InjectedForecastProps {
    children: (props: ForecastResults, forecast: Forecast) => JSX.Element | null;
    storage: Storage,
    expire?: number | 'never';
}

interface ForecastEnhancerState {
    loading: boolean;
    results: ForecastResults | null;
    error: any | null;
}

class ForecastEnhancer extends React.Component<ForecastEnhancerProps, ForecastEnhancerState> {
    forecast: Forecast;
    state: ForecastEnhancerState = {
        loading: false,
        results: null,
        error: null,
    };
    constructor(props: ForecastEnhancerProps) {
        super(props);
        this.forecast = forecast(props.apiKey, props.isPro);
        this.forecast.store(props.storage, props.expire);
        this.forecast.error(error => this.setState({ error }));
    }
    public async componentDidMount() {
        const { props } = this;
        if (props.setup) {
            props.setup(this.forecast);
        }
        await this.resolveQuery();
    }
    public async componentDidUpdate(prevProps: ForecastEnhancerProps) {
        const { props } = this;
        const prevForecast = this.forecast.copy();
        if (props.setup) {
            props.setup(this.forecast);
        }
        if (prevForecast.dates[0].getTime() !== this.forecast.dates[0].getTime()
            || prevForecast.dates[1].getTime() !== this.forecast.dates[1].getTime()
            || !this.compareLocators(prevForecast.location, this.forecast.location)
            || prevForecast.unit !== this.forecast.unit
            || prevForecast.lang !== this.forecast.lang
            || !this.compareLists(props.query, prevProps.query)
        ) {
            await this.resolveQuery();
        }
    }

    public render() {
        const { props, state } = this;
        if (state.error) {
            if (props.errorComponent) {
                const ErrorComponent = props.errorComponent;
                return (
                    <ErrorComponent error={state.error} />
                );
            }
            return null;  
        }
        if (state.loading) {
            if (props.loadingComponent) {
                return props.loadingComponent();
            }
            return null;
        }
        if (state.results) {
            return props.children(state.results, this.forecast);
        }
        return null;
    }

    private compareLocators = (a: Locator, b: Locator) => {
        const aItem = a.get();
        const bItem = b.get();
        if (aItem.kind !== bItem.kind) {
            return false;
        }
        switch (aItem.kind) {
            case 'geo':
                return aItem.geo.lat === (bItem as any).geo.lat && aItem.geo.lon === (bItem as any).geo.lon;
            case 'id':
                return aItem.id === (bItem as any).id;
            case 'ids':
                return this.compareLists(aItem.ids, (bItem as any).ids);
            case 'nothing':
                return true;
            case 'place':
                return aItem.place === (bItem as any).place;
            case 'places':
                return this.compareLists(aItem.places, (bItem as any).places);
            case 'zip':
                return aItem.zip.code === (bItem as any).zip.code && aItem.zip.country === (bItem as any).zip.country;
            
        }
    }

    private compareLists = (a: Array<string | number>, b: Array<string | number>) => a.length === b.length
        && a.reduce((p: boolean, c, i) => !p ? false : c === b[i], true);

    private resolveQuery = async () => {
        const { props } = this;
        this.setState({ loading: true, error: null });
        const acc: ForecastResults = {};
        const list = this.forecast.list(props.by);
        for (let i = 0; i < props.query.length; i++) {
            const item = props.query[i];
            acc[item] = await list[item]() as any;
        }
        this.setState({ loading: false, error: null, results: acc });
    }
}

const weatherEnhancer = <T extends object>(
    Component: (new (props: T & ForecastResults) => JSX.Element | null)
        | ((props: T & ForecastResults) => JSX.Element | null),
    storage: Storage = localStorage,
    expire?: 'never' | number,
) => (props: Omit<Omit<T, 'data'>, 'forecast'> & InjectedForecastProps) => (
    <ForecastEnhancer
        {...props}
        storage={storage}
        expire={expire}
    >
        {(results, forecast) => (
            <Component {...props as any} data={results} forecast={forecast} />
        )}
    </ForecastEnhancer>
);

export default weatherEnhancer;
