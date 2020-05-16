# Transformation & Spaces

There are generally 4 sets of coordinate spaces that you should be aware of when working with GraphPaper:

- Screen space
- Page space
- Sheet space
- Entity space

Screen space is the coordinate space of the window/viewport. 

Page space is the coordinate space of the [DOM page](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction). Coordinates you get from a Sheet are in Page space.

Sheet space is the coordinate space of a Sheet within a Page, with the origin being the top, left of the Sheet DOM element. As a Sheet is the container for an Entity, when you get coordinates of an Entity [e.g. `Entity.getX()`, `Entity.getY()`], the coordinates are in Sheet space. However, you will find specific methods to get coordinates transformed to Page space [e.g. `Entity.getPositionOnPage()`].

Entity space is the coordinate space of an Entity within a Sheet, with the origin being the top, left of the Entity DOM element.

Be concious of what coordinate system you're working in and note where you may need to do a transformation.
