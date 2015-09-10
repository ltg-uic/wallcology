# Wallcology

## For developers

#### Simulation bot

The internal state of the simulation bot:

```
state = {
	timestamp: 752465236743527274,
	population: [
		[0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5],
		[0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5],
		[0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5],
		[0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5]

	]
}
```
In order to access the species of habitat of the i-th element of the history:
`state[‘population’][habitat][species]`

#### History bot

The internal state of the history bot:
```
history = {
	population_history: [
		{
			timestamp: 752465236743527274,
			population: [
				[0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5],
				[0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5],
				[0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5],
				[0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5]
				]
		}
	],
	species_events: [
		{
			timestamp: 752465236743527274
			habitat: 0,
			species: 3,
			event: <event>
		}
	],
	habitat_events: [
		{
			timestamp: 752465236743527274
			habitat: 0,
			event: <event>
		}
	]

}
```

In order to access the species of habitat of the i-th element of the history:
`history [‘population_history’] [i] [‘population’] [habitat] [species]`

#### Timestamp

All the timestamps (milliseconds in UTC since 1-1-1970) are generated with the function:
`var timestamp = Date.now()`

If you want to go back to the standard date object:
`var date = new Date(timestamp)`

#### Communication protocol

##### channel: control_specie_event
`{timestamp: 54723547237, habitat: 0, species: 3, action: <action>} <action> := "kill" | "increase" | "harvest" | "colonize"`

##### channel: control_habitat_event	[DRAFT]
`{timestamp: 54723547237, habitat: 0, action: <action>}  <action> := "warmer" | "colder" | "more_wall_space" | "less_wall_space"`

##### channel: update_population
```
{
	timestamp: 54723547237,
	population: [
		[0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5],
		[0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5],
		[0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5],
		[0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5]
	]
}
```


