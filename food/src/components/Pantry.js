import React, { useState } from 'react';
import './Pantry.css'; // Import CSS file for styling

const Pantry = () => {
  const [pantryItems, setPantryItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  // Function to add an item to the pantry
  const addItemToPantry = (item) => {
    setPantryItems([...pantryItems, item]);
  };

  // Function to remove an item from the pantry
  const removeItemFromPantry = (index) => {
    const updatedItems = pantryItems.filter((_, i) => i !== index);
    setPantryItems(updatedItems);
  };

  // Function to handle selection of an item
  const handleItemSelected = (item) => {
    if (selectedItems.includes(item)) {
      const updatedItems = selectedItems.filter((selectedItem) => selectedItem !== item);
      setSelectedItems(updatedItems);
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  return (
    <div>
      <h2>Pantry Management</h2>
      <div>
        <h3>Add Items to Your Pantry</h3>
        <div className="pantry-items-container">
          {/* Interactive selection of pantry items */}
          <div className="pantry-item" onClick={() => addItemToPantry('Flour')}>
            <img src="/images/flour.png" alt="Flour" />
            <div className="item-text">Flour</div>
          </div>
          <div className="pantry-item" onClick={() => addItemToPantry('Sugar')}>
            <img src="/images/sugar.png" alt="Sugar" />
            <div className="item-text">Sugar</div>
          </div>
          <div className="pantry-item" onClick={() => addItemToPantry('Salt')}>
            <img src="/images/salt.png" alt="Salt" />
            <div className="item-text">Salt</div>
          </div>
          {/* Add more images for other pantry items */}
        </div>
      </div>
      <div>
        <h3>Your Pantry Items</h3>
        <ul>
          {/* Display pantry items */}
          {pantryItems.map((item, index) => (
            <li key={index}>
              {item}
              {/* Button to remove item from pantry */}
              <button onClick={() => removeItemFromPantry(index)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Generate Recipes</h3>
        <button onClick={() => console.log('Generate recipes based on selected items:', selectedItems)}>
          Generate Recipes
        </button>
      </div>
    </div>
  );
};

export default Pantry;
