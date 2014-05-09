jetSlider
=========

Simple plugin for making beautiful page transitions


Options
=======

| Option             | Type       | Default                                                | Description |
| ------------------ | ---------- | ------------------------------------------------------ | ----------- |
| slideSelector      | *String*   | `'section'`                                            | Selector of the slide elements |
| transitionDuration | *Number*   | `800`                                                  | Duration of transition between slides |
| scroll             | *Boolean*  | `true`                                                 | Changing slides by mouse scroll |
| keyboard           | *Boolean*  | `true` if parent element is &lt;body&gt;. Else `false` | Changing slides by keyboard arrows |
| easing             | *String*   | `'ease-in-out'`                                        | Easing function e.g. `'linear'`, `'ease-in'`, `'cubic-bezier(0.42,0,0.58,1)'`... |
| onBeforeMove       | *Function* | `null`                                                 | Function which will be called with `newIndex` and `oldIndex` arguments every time when animation starts |
| onAfterMove        | *Function* | `null`                                                 | Function which will be called with `newIndex` and `oldIndex` arguments every time when animation ends |
| jsFallback         | *Boolean*  | `true`                                                 | If `true` js fallback will be used for animations in browsers which don't support css transorms and transitions. If `false` slides will change without animation in those browsers |


Options can be changed after initialization:
```javascript
$('.slider').jetSlider(optionName, value);
```

Move methods
============

```javascript
$('.slider').jetSlider('moveto', index);
```

```javascript
$('.slider').jetSlider('moveup');
```

```javascript
$('.slider').jetSlider('movedown');
```


Like declarative initialization?
================================

You can initialize plugin without js code! Just add `data-jetslider` attribute to slider container.

Options can be customized by using data-* attributes:

```html
<div class="main" data-jetslider data-slide-selector=".page" data-transition-duration="2000" data-easing="ease-in">
     <section class="page">
         ...
     </section>
     ...
     <section class="page">
         ...
     </section>
     ...
 </div>
```
