# Statsig Github Actions SDK

A Github Action wrapper for the [Statsig Node JS server SDK](https://github.com/statsig-io/node-js-server-sdk/).

Allows you to evaluate gates and configs directly within a github action.

## Inputs

### `sdk-key`

**Required** Statsig server SDK key.

### `user`

**Required** User JSON to use for evaluating. See [StatsigUser](https://docs.statsig.com/server/concepts/user).

### `environment`

Statsig environment tier.

### `log-exposures`

Whether or not to log exposures. Default `false`

### `gates`

List of feature gates to evaluate separated by newline.

### `configs`

List of dynamic configs to evaluate separated by newline.

### `experiment`

List of experiments to evaluate separated by newline.

### `events`

List of events to log separated by newline.

## Outputs

### `gate::<GATE-NAME>`

The evaluated value of the gate

### `config::<CONFIG-NAME>::<PARAM-NAME>`

The param value of the evaluated config

### `experiment::<EXPERIMENT-NAME>::<PARAM-NAME>`

The param value of the evaluated experiment

## Example usage

```yaml
jobs:
  statsig-example:
    runs-on: ubuntu-latest
    steps:
      - name: Evaluate
        id: statsig
        uses: statsig-io/github-sdk
        with:
          sdk-key: 'secret-key'
          user: '{ "userID": "test123", "email": "test123@statsig.com" }'
          log-exposures: 'false'
          gates: | 
            'example_gate_1'
            'example_gate_2'
          configs: 'example_config'
          experiments: 'example_experiment'
          events: |
            { "eventName": "example_event_1", "value": 1, "metadata": { "some string": "string", "some number": 123} }
            { "eventName": "example_event_2", "value": 2, "user": { "userID": "test456", "email": "test456@statsig.com" } }
      - name: Print output
        run: |
          echo ${{ steps.statsig.outputs['gate::example_gate_1'] }}
          echo ${{ steps.statsig.outputs['gate::example_gate_2'] }}
          echo '${{ toJSON(steps.statsig.outputs['config::example_config::some key']) }}'
          echo '${{ toJSON(steps.statsig.outputs['experiment::example_experiment::some param']) }}'
run: 
```
