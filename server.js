import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 6000;

function generateHTML(blog, customMetaTags = [], id) {
    console.log("🚀 ~ generateHTML ~ customMetaTags:", customMetaTags)
    let tags = `
    <title>${blog?.meta_title || blog?.title || "Blog"}</title>
    <meta name="description" content="${blog?.meta_description || ""}">
    <meta name="keywords" content="${blog?.meta_keywords || ""}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${blog?.meta_title || blog?.title || "Blog"}">
    <meta property="og:description" content="${blog?.meta_description || ""}">
    <meta property="og:image" content="${blog?.image || "https://example.com/default-image.jpg"}">
    <meta property="og:image:alt" content="${blog?.image_alt || "Default image description"}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${blog?.url || "https://example.com"}">
    <meta property="og:site_name" content="${blog?.site_name || "Your Site Name"}">
  
    <!-- Twitter/X Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${blog?.meta_title || blog?.title || "Blog"}">
    <meta name="twitter:description" content="${blog?.meta_description || ""}">
    <meta name="twitter:image" content="${blog?.image || "https://example.com/default-image.jpg"}">
    <meta name="twitter:image:alt" content="${blog?.image_alt || "Default image description"}">
  `;
  
  // List of existing meta tag keys to prevent duplicates
  const existingKeys = {
    property: [
      "og:title",
      "og:description",
      "og:image",
      "og:image:alt",
      "og:image:width",
      "og:image:height",
      "og:type",
      "og:url",
      "og:site_name",
    ],
    name: [
      "description",
      "keywords",
      "twitter:card",
      "twitter:title",
      "twitter:description",
      "twitter:image",
      "twitter:image:alt",
    ],
  };
  
  // Add custom meta tags, avoiding duplicates
  if (Array.isArray(customMetaTags)) {
    customMetaTags.forEach((tag) => {
      // Check if the tag's key already exists in the corresponding type
      if (tag.type === "property" && !existingKeys.property.includes(tag.key)) {
        tags += `<meta property="${tag.key}" content="${tag.content || ""}">`;
      } else if (tag.type === "name" && !existingKeys.name.includes(tag.key)) {
        tags += `<meta name="${tag.key}" content="${tag.content || ""}">`;
      }
    });
  }

    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${tags}
      </head>
      <body>
        <script>
          window.location.href = "https://develop.realchaininvestments.com/blogs/${id}";
        </script>
      </body>
    </html>`;
  }


app.get("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // fetch blog from API
    const response = await fetch(`https://api.realchaininvestments.com/api/v1/public/blogs/${id}`);
    const data = await response.json();
    console.log("🚀 ~ data:", data)

    if (!data?.blog) {
      return res.status(404).send("Blog not found");
    }

    const html = generateHTML(data.blog, data.blog.custom_meta_tags || [], id);
    console.log("🚀 ~ html:", html)
    res.send(html);
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).send("Internal Server Error");
  }
});

// fallback for all other routes
app.get("*", (req, res) => {
  res.redirect("https://develop.realchaininvestments.com");
});

app.listen(PORT, () => {
  console.log(`Meta server running at http://localhost:${PORT}`);
});
