# Processor Definition

## basic infomation

```javacript
{
  schema,
  params,
  fn,
  paramType,
  parentPath,
  type,
  isieldArrayDefItem
}
```

* **type**

*Compute*, value calculation based on the values from other properties

*Validation*, validate the data presents is correct or not

*Condition*, value update triggered by condition changes

*Options*, similiar to codes table/option look up triggered by condition changes based on the data, to be added

* **schema**

The schema the processor is working on, can be used by the processor to obtain additional information from the schema, like the title, the description, therefore the logic can use it.

* **params**

definition of the params, used to grab the params from the data, mandatory when paramType === param, and optional when paramType === mixed, ignored when paramType is other value

* **fn**

the processor function to run, it expect the following inputs (data, services)=>{}

*@param_1*, data, the normalized values for the currentData/param/the parent data/rootData, or combination of all, also if the def is for a field array, then also would have 'idx' about the location of the idx.

```javascript
{
  data,
  params,
  parentData, //the parent data of the
  rootData
}
```

*@param_2*, runInfo, a collection of information for the run, such as,
rootData for all,
parentArray and idx for field array
externalServiceCall, (TBC) a object of function collection { fn1, fn2}, to be implemented

* **paramType**

To indicate what kind data to pass to fn when it is called. Enum of values show below
data
 > the data to the current path of where the processor defined **default**

param
 > to use normalized value only as param, then the logic should grab value from data for each of the param and inside the fn, the code can use the param like this data.{paramName}. This is the most recommandated way, as it prompt the highest reusability.

parentData
 > to use the data from the parent object only to in the logic. This is better than the rootData type, as it isolated the fn logic the data of the current object, therefore the def can reused. The code access the value like data.{path}, the length of {path} >= length of {paramName}. If no **params** supplied in the processor defintion, then default to use this

rootData
 > use the entire data object tree as the params, not recommanded as the processor is at the root level of the form, as this makes the logic tied into the current form. The logic access the value as data.{path}, and the .{path} is longer than the .{path} if using parentData

mixed:
 > data will be an object of { params, parentData, rootData }. The logic would access the values like data.params.p1/data.parentData.{path}/data.rootData.{path}

* **isFieldArrayDefItem**

To indicate that the data definition the processor is belonging to is the def of fieldArrayItem
