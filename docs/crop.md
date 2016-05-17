# Crop

A jQuery plugin for touch-friendly cropping.

<!-- HEADER END -->

<!-- NAV START -->

* [Use](#use)
* [Options](#options)
* [Methods](#methods)
* [CSS](#css)

<!-- NAV END -->

<!-- DEMO BUTTON -->

## <a name="use"></a> Using Crop


#### Main

```markup
crop.js
crop.css
```


#### Dependencies

```markup
jQuery
core.js
touch.js
```

### Basic



## <a name="options"></a> Options

Set instance options by passing a valid object at initialization, or to the public `defaults` method. Custom options for a specific instance can also be set by attaching a `data-crop-options` attribute to the target elment. This attribute should contain the properly formatted JSON object representing the custom options.

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `customClass` | `string` | `''` | Class applied to instance |
| `theme` | `string` | `"fs-light"` | Theme class name |

<hr>
## <a name="methods"></a> Methods

Methods are publicly available to all active instances, unless otherwise stated.

### defaults

Extends plugin default settings; effects instances created hereafter.

```javascript
$.crop("defaults", { ... });
```

#### Parameters

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `object` | `{}` | New plugin defaults |

### destroy

Removes plugin instance.

```javascript
$(".target").crop("destroy");
```

<hr>
## <a name="css"></a> CSS

| Class | Type | Description |
| --- | --- | --- |
| `.fs-crop-element` | `element` | Target elmement |
| `.fs-crop` | `element` | Base widget class |
| `.fs-crop-enabled` | `modifier` | Indicates enabled state |

