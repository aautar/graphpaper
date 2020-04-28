# Adding, removing, and querying entities on a sheet

## Add an entity to the sheet

```javascript
sheet.addEntity(entityId);
```

## Remove an entity from the sheet

```javascript
sheet.removeEntity(entityId);
```
The entity will remove it from the sheet. Remove in this context means that the object will no longer be managed by the sheet, it won't respond to canvas changes and it won't emit object events. The caller is responsible for removing the entity's DOM elements, due to the caller being responsible for the creation of the DOM elements.
 

## Get a specific entity by its ID

```javascript
sheet.getEntityById(entityId);
```

## Get all entities on the sheet

```javascript
sheet.getAllEntities();
```

## Get all entities around a certain point on the sheet

```javascript
sheet.getEntitiesAroundPoint(targetX, targetY, radius);
```

Note that this function tests for surrounding objects based on intersection of a box centered at (targetX, targetY) with the given radius.

