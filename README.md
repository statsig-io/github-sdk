# Statsig Github Actions SDK

A Github Action wrapper for the [Statsig Node JS server SDK](https://github.com/statsig-io/node-js-server-sdk/).

Allows you to evaluate gates and configs directly within a github action.

## Inputs

### `sdk-key`

**Required** Statsig server SDK key.

### `user`

**Required** User JSON to use for evaluating. See [StatsigUser](https://docs.statsig.com/server/concepts/user).

### `log-exposures`

Whether or not to log exposures. Default `false`

### `gates`

List of feature gates to evaluate separated by newline.

### `configs`

List of dynamic configs to evaluate separated by newline.

## Outputs

### `gate_<GATE-NAME>`

The evaluated value of the gate

### `config_<CONFIG-NAME>_<PARAM-NAME>`

The param value of the evaluated config

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
            example_gate_1
            example_gate_2
          configs: example_config
      - name: Print output
        run: |
          echo ${{ steps.statsig.outputs.gate_example_gate_1 }}
          echo ${{ steps.statsig.outputs.gate_example_gate_2 }}
          echo '${{ toJSON(steps.statsig.outputs.config_example_config) }}'
run: 
```
