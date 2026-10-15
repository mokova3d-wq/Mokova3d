# Mokova JSON Admin — v10

## What is now JSON-driven
- `products.json` — products, multiple categories, main image, product gallery, price, stock, SKU, weight, material, dimensions, colours, badge, SEO fields, delivery note, visibility and featured status.
- `categories.json` — category name, description, image, order and visibility.
- `gallery.json` — all 60 gallery images mapped to categories, with title, alt text, visibility, featured flag and sort order.
- `reviews.json` — customer name, email, phone, product, rating, comment, Mokova reply, visibility and date.
- `faq.json` — FAQ items and visibility.
- `pages.json` — About, Contact, Shipping, Returns, Privacy and Terms content.
- `site-config.json` — homepage, announcement, SEO and social settings.

## Admin
Open `admin.html` and use the browser-only admin lock. Default password on a fresh browser is:

`Mokova@1234`

Change it immediately from **Security**.

## Publishing
For GitHub Pages:
1. Edit data in Admin.
2. Download a full backup.
3. Publish the individual JSON files from **Publish / Backup**, or manually upload the changed JSON files to the repository.
4. If you use the GitHub API publisher, use a fine-grained token with only the repository Contents permission needed for the target repo. Do not commit the token.

## Important static-hosting limitation
GitHub Pages cannot securely write JSON files from the browser. Therefore customer enquiries and public review submissions are not centrally stored. The enquiry opens WhatsApp and a local browser copy is retained; review submissions are kept in localStorage on that customer's device until a backend is added.

## Product/category model
Products support multiple categories through `categoryIds`. This means one product can appear under more than one category, e.g. a devotional shadow lamp can belong to both **Spiritual & Devotional** and **Lamps & Lighting**.

## Gallery
The public Gallery is now generated from `gallery.json` and has category filters. Product detail pages also show the product's gallery images from the `gallery` array in `products.json`.


## Imported review data
The supplied mokova.csv contained reviewer name, email and rating only. Imported reviews are assigned provisionally across products; phone and review text were not invented. Admin can edit product, text, visibility and reply. Imported records are flagged when review text/product mapping needs confirmation.
