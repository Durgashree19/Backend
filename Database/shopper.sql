-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Mar 19, 2025 at 06:06 AM
-- Server version: 10.4.22-MariaDB
-- PHP Version: 8.1.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shopper`
--

-- --------------------------------------------------------

--
-- Table structure for table `ai_recommendations`
--

CREATE TABLE `ai_recommendations` (
  `Recommendation_ID` int(11) NOT NULL,
  `User_ID` int(11) DEFAULT NULL,
  `Product_ID` int(11) DEFAULT NULL,
  `AI_Score` varchar(45) DEFAULT NULL,
  `AI_Recommendationscol` float DEFAULT NULL,
  `Timestamp` timestamp(6) NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

-- CREATE TABLE `brands` (
--   `Brand_ID` int(11) NOT NULL,
--   `Brand_Name` varchar(100) DEFAULT NULL,
--   `Description` text DEFAULT NULL
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `Category_ID` int(11) NOT NULL,
  `Category_Name` varchar(100) DEFAULT NULL,
  `Parent_Category_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--

-- ORDERS table (no Product_ID, Color, Size here anymore)
CREATE TABLE orders (
  Order_ID INT AUTO_INCREMENT PRIMARY KEY,
  User_ID INT NOT NULL,
  Order_Status ENUM('Pending','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
  Total_Amount DECIMAL(10, 2) NOT NULL,
  Order_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Shipping_ID INT,
  FOREIGN KEY (User_ID) REFERENCES users(User_ID),
  FOREIGN KEY (Shipping_ID) REFERENCES shipping_details(Shipping_ID)
);

-- ORDER ITEMS table to store individual product details
CREATE TABLE order_items (
  Order_Item_ID INT AUTO_INCREMENT PRIMARY KEY,
  Order_ID INT NOT NULL,
  Product_ID INT NOT NULL,
  Quantity INT NOT NULL,
  Size VARCHAR(100) NOT NULL,
  Color VARCHAR(100) NOT NULL,
  Subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (Order_ID) REFERENCES orders(Order_ID) ON DELETE CASCADE,
  FOREIGN KEY (Product_ID) REFERENCES products(Product_ID)
);


-- --------------------------------------------------------

-- Table structure for table `favourites`

CREATE TABLE favourites (
  Favourite_ID INT AUTO_INCREMENT PRIMARY KEY,
  User_ID INT NOT NULL,
  Product_ID INT NOT NULL,
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_fav (User_ID, Product_ID),
  FOREIGN KEY (User_ID) REFERENCES users(User_ID) ON DELETE CASCADE,
  FOREIGN KEY (Product_ID) REFERENCES products(Product_ID) ON DELETE CASCADE
);


-- --------------------------------------------------------


--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `Order_Item_ID` int(11) NOT NULL,
  `Order_ID` int(11) DEFAULT NULL,
  `Product_ID` int(11) DEFAULT NULL,
  `Quantity` int(11) NOT NULL,
  `Subtotal` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `Payment_ID` int(11) NOT NULL,
  `Payment_Method` enum('Credit Card','PayPal','UPI','Bank Transfer') DEFAULT NULL,
  `Transaction_Status` enum('Pending','Completed','Failed') DEFAULT NULL,
  `Amount_Paid` decimal(10,2) DEFAULT NULL,
  `Transaction_Date` timestamp(6) NULL DEFAULT NULL,
  `User_ID` int(11) NOT NULL,
  `Order_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `Product_ID` int(11) NOT NULL,
  `Name` varchar(100) DEFAULT NULL,
  `Description` text DEFAULT NULL,
  `Price` decimal(10,2) DEFAULT NULL,
  `Stock_Quantity` int(11) DEFAULT NULL,
  `Rating` float DEFAULT NULL,
  `Size` varchar(100) NOT NULL,
  `Color` varchar(100) NOT NULL,
  `AI_Tagging` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`AI_Tagging`)),
  `Category_ID` int(11) DEFAULT NULL,
  -- `Brand_ID` int(11) DEFAULT NULL,
  `Seller_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE product_images (
  Image_ID INT AUTO_INCREMENT PRIMARY KEY,
  Product_ID INT NOT NULL,
  Color VARCHAR(100),
  Image_Data LONGBLOB,
  MIME_Type VARCHAR(100),
  FOREIGN KEY (Product_ID) REFERENCES products(Product_ID) ON DELETE CASCADE
);

-- CREATE TABLE `products` (
--   `id` INT NOT NULL AUTO_INCREMENT,
--   `name` VARCHAR(100) NOT NULL,
--   `description` TEXT,
--   `price` DECIMAL(10, 2) NOT NULL,
--   `stock` INT DEFAULT 0,
--   PRIMARY KEY (`id`)
-- );


-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `Review_ID` int(11) NOT NULL,
  `User_ID` int(11) DEFAULT NULL,
  `Product_ID` int(11) DEFAULT NULL,
  `Rating` int(11) DEFAULT NULL,
  `Review_Text` text DEFAULT NULL,
  `Review_Date` timestamp(6) NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `sellers`
--

CREATE TABLE `sellers` (
  `Seller_ID` int(11) NOT NULL,
  `User_ID` int(11) DEFAULT NULL,
  `Store_Name` varchar(100) DEFAULT NULL,
  `Store_Description` text DEFAULT NULL,
  `Contact_Number` varchar(20) DEFAULT NULL,
  `Rating` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `shipping_details`
--

CREATE TABLE `shipping_details` (
  `Shipping_ID` int(11) NOT NULL,
  `User_ID` int(11) DEFAULT NULL,
  `Shipping_Address` text DEFAULT NULL,
  `City` varchar(100) DEFAULT NULL,
  `State` varchar(100) DEFAULT NULL,
  `Country` varchar(100) DEFAULT NULL,
  `Zip_Code` varchar(10) DEFAULT NULL,
  `Tracking_Number` varchar(50) DEFAULT NULL,
  `Carrier` varchar(50) DEFAULT NULL,
  `Status` enum('Shipped','In Transit','Delivered','Returned') DEFAULT NULL,
  `Order_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `shopping_cart`
--

CREATE TABLE `shopping_cart` (
  `Cart_ID` int(11) NOT NULL,
  `User_ID` int(11) DEFAULT NULL,
  `Product_ID` int(11) DEFAULT NULL,
  `Quantity` int(11) DEFAULT NULL,
  `Size` varchar(100) NOT NULL,
  `Color` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `User_ID` int(11) NOT NULL,
  `First_Name` varchar(50) DEFAULT NULL,
  `Last_Name` varchar(50) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Address` text DEFAULT NULL,
  `Role` enum('Customer','Seller','Admin') DEFAULT NULL,
  `Date_Joined` timestamp(6) NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_recommendations`
--
ALTER TABLE `ai_recommendations`
  ADD PRIMARY KEY (`Recommendation_ID`),
  ADD KEY `User_ID_idx` (`User_ID`),
  ADD KEY `Product_ID_idx` (`Product_ID`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`Brand_ID`),
  ADD UNIQUE KEY `Brand_Name_UNIQUE` (`Brand_Name`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`Category_ID`),
  ADD UNIQUE KEY `Category_Name_UNIQUE` (`Category_Name`),
  ADD KEY `Parent_Category_ID_idx` (`Parent_Category_ID`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`Order_ID`),
  ADD KEY `User_ID_idx` (`User_ID`),
  ADD KEY `Payment_ID_idx` (`Payment_ID`),
  ADD KEY `Shipping_ID_idx` (`Shipping_ID`),
  ADD KEY `Product_ID` (`Product_ID`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`Order_Item_ID`),
  ADD KEY `Order_ID_idx` (`Order_ID`),
  ADD KEY `Product_ID_idx` (`Product_ID`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`Payment_ID`),
  ADD KEY `User_ID` (`User_ID`),
  ADD KEY `Order_ID` (`Order_ID`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`Product_ID`),
  ADD KEY `Category_ID_idx` (`Category_ID`),
  ADD KEY `Brand_ID_idx` (`Brand_ID`),
  ADD KEY `Seller_ID_idx` (`Seller_ID`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`Review_ID`),
  ADD KEY `Product_ID_idx` (`Product_ID`),
  ADD KEY `User_ID_idx` (`User_ID`);

--
-- Indexes for table `sellers`
--
ALTER TABLE `sellers`
  ADD PRIMARY KEY (`Seller_ID`),
  ADD KEY `User_ID_idx` (`User_ID`);

--
-- Indexes for table `shipping_details`
--
ALTER TABLE `shipping_details`
  ADD PRIMARY KEY (`Shipping_ID`),
  ADD UNIQUE KEY `Tracking_Number_UNIQUE` (`Tracking_Number`),
  ADD KEY `User_ID` (`User_ID`),
  ADD KEY `Order_ID` (`Order_ID`);

--
-- Indexes for table `shopping_cart`
--
ALTER TABLE `shopping_cart`
  ADD PRIMARY KEY (`Cart_ID`),
  ADD KEY `Product_ID_idx` (`Product_ID`),
  ADD KEY `User_ID_idx` (`User_ID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`User_ID`),
  ADD UNIQUE KEY `Email_UNIQUE` (`Email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ai_recommendations`
--
ALTER TABLE `ai_recommendations`
  MODIFY `Recommendation_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `Brand_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `Category_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `Order_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `Order_Item_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `Payment_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `Product_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `Review_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sellers`
--
ALTER TABLE `sellers`
  MODIFY `Seller_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shipping_details`
--
ALTER TABLE `shipping_details`
  MODIFY `Shipping_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shopping_cart`
--
ALTER TABLE `shopping_cart`
  MODIFY `Cart_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `User_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ai_recommendations`
--
ALTER TABLE `ai_recommendations`
  ADD CONSTRAINT `fk_AI_product` FOREIGN KEY (`Product_ID`) REFERENCES `products` (`Product_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_AI_user` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `Parent_Category_ID` FOREIGN KEY (`Parent_Category_ID`) REFERENCES `categories` (`Category_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_payment` FOREIGN KEY (`Payment_ID`) REFERENCES `payments` (`Payment_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_orders_shipping` FOREIGN KEY (`Shipping_ID`) REFERENCES `shipping_details` (`Shipping_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`Product_ID`) REFERENCES `products` (`Product_ID`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `Order_ID` FOREIGN KEY (`Order_ID`) REFERENCES `orders` (`Order_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `Product_ID` FOREIGN KEY (`Product_ID`) REFERENCES `products` (`Product_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`),
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`Order_ID`) REFERENCES `orders` (`Order_ID`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `Brand_ID` FOREIGN KEY (`Brand_ID`) REFERENCES `brands` (`Brand_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `Category_ID` FOREIGN KEY (`Category_ID`) REFERENCES `categories` (`Category_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `Seller_ID` FOREIGN KEY (`Seller_ID`) REFERENCES `sellers` (`Seller_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_product` FOREIGN KEY (`Product_ID`) REFERENCES `products` (`Product_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_reviews_user` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `sellers`
--
ALTER TABLE `sellers`
  ADD CONSTRAINT `User_ID` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `shipping_details`
--
ALTER TABLE `shipping_details`
  ADD CONSTRAINT `shipping_details_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`),
  ADD CONSTRAINT `shipping_details_ibfk_2` FOREIGN KEY (`Order_ID`) REFERENCES `orders` (`Order_ID`);

--
-- Constraints for table `shopping_cart`
--
ALTER TABLE `shopping_cart`
  ADD CONSTRAINT `fk_shopping_product` FOREIGN KEY (`Product_ID`) REFERENCES `products` (`Product_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_shopping_user` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
