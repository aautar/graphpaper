# Transformation & Spaces

There are generally 4 sets of coordinate spaces that you should be aware of when working with GraphPaper:

- **Screen space**: the coordinate space of the [window](https://developer.mozilla.org/en-US/docs/Web/API/Window)
- **Page space**: the coordinate space of the [DOM page](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction)
- **Sheet space**: the coordinate space of a GraphPaper Sheet
- **Entity space**:  the coordinate space of an GraphPaper Entity

The diagram below show the relationship between these spaces. Note that the origin of each space is at the top, left.

![GraphPaper Spaces](graphpaper-coordinate-spaces-2.svg?raw=true "GraphPaper Spaces")

All spaces may be tranformed in some way via CSS transform or CSS positioning. In addition, spaces may be cutoff and scrolling offsets may come into play. Be concious of what coordinate system you're working in and note where you may need to do a transformation.

Method names that don't specific a space, will return coordinates or dimensions relative to the space they're embedded in. For example, `Entity.getX()` and `Entity.getY()` will return X, Y coordinates in Sheet space. In contrast, `Entity.getPositionOnPage()` will return an object giving coordinates transformed to Page space, even though the Entity lives in Sheet page.
