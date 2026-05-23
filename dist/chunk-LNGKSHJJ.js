#!/usr/bin/env node

// src/schema/v5/upstream/resume/data.ts
import z2 from "zod";

// src/schema/v5/upstream/templates.ts
import z from "zod";
var templateSchema = z.enum([
  "azurill",
  "bronzor",
  "chikorita",
  "ditgar",
  "ditto",
  "gengar",
  "glalie",
  "kakuna",
  "lapras",
  "leafish",
  "meowth",
  "onyx",
  "pikachu",
  "rhyhorn",
  "scizor"
]);

// src/schema/v5/upstream/resume/data.ts
var iconSchema = z2.string().describe(
  "The icon to display for the custom field. Must be a valid icon name from @phosphor-icons/web icon set, or an empty string to hide. Default to '' (empty string) when unsure which icons are available."
);
var iconColorSchema = z2.string().catch("").describe(
  "Custom color for the icon, defined as rgba(r, g, b, a). Leave blank to use the template default icon color."
);
var websiteSchema = z2.object({
  url: z2.string().describe("The URL to show as a link. Must be a valid URL with a protocol (http:// or https://)."),
  label: z2.string().describe("The label to display for the URL. Leave blank to display the URL as-is.")
});
var itemWebsiteSchema = websiteSchema.extend({
  inlineLink: z2.boolean().catch(false).describe(
    "If true, the website URL is rendered as a hyperlink on the title instead of a separate link at the bottom."
  )
}).catch({ url: "", label: "", inlineLink: false });
var pictureSchema = z2.object({
  hidden: z2.boolean().describe("Whether to hide the picture from the resume."),
  url: z2.string().describe(
    "The URL to the picture to display on the resume. Prefer local app-served paths (for example /uploads/...) populated via upload."
  ),
  size: z2.number().min(32).max(512).describe("The size of the picture to display on the resume, defined in points (pt)."),
  rotation: z2.number().min(0).max(360).describe("The rotation of the picture to display on the resume, defined in degrees (\xB0)."),
  aspectRatio: z2.number().min(0.5).max(2.5).describe(
    "The aspect ratio of the picture to display on the resume, defined as width / height (e.g. 1.5 for 1.5:1 or 0.5 for 1:2)."
  ),
  borderRadius: z2.number().min(0).max(100).describe("The border radius of the picture to display on the resume, defined in points (pt)."),
  borderColor: z2.string().describe("The color of the border of the picture to display on the resume, defined as rgba(r, g, b, a)."),
  borderWidth: z2.number().min(0).describe("The width of the border of the picture to display on the resume, defined in points (pt)."),
  shadowColor: z2.string().describe("The color of the shadow of the picture to display on the resume, defined as rgba(r, g, b, a)."),
  shadowWidth: z2.number().min(0).describe("The width of the shadow of the picture to display on the resume, defined in points (pt).")
});
var customFieldSchema = z2.object({
  id: z2.string().describe("The unique identifier for the custom field. Usually generated as a UUID."),
  icon: iconSchema,
  text: z2.string().describe("The text to display for the custom field."),
  link: z2.string().describe("If the custom field should be a link, the URL to link to.").catch("")
});
var basicsSchema = z2.object({
  name: z2.string().describe("The full name of the author of the resume."),
  headline: z2.string().describe("The headline of the author of the resume."),
  email: z2.string().describe("The email address of the author of the resume."),
  phone: z2.string().describe("The phone number of the author of the resume."),
  location: z2.string().describe("The location of the author of the resume."),
  website: websiteSchema.describe("The website of the author of the resume."),
  customFields: z2.array(customFieldSchema).describe("The custom fields to display on the resume.")
});
var summarySchema = z2.object({
  title: z2.string().describe("The title of the summary of the resume."),
  columns: z2.number().int().min(1).max(6).catch(1).describe("The number of columns the summary should span across."),
  hidden: z2.boolean().describe("Whether to hide the summary from the resume."),
  content: z2.string().describe("The content of the summary of the resume. This should be a HTML-formatted string.")
});
var baseItemSchema = z2.object({
  id: z2.string().describe("The unique identifier for the item. Usually generated as a UUID."),
  hidden: z2.boolean().describe("Whether to hide the item from the resume.")
});
var summaryItemSchema = baseItemSchema.extend({
  content: z2.string().describe("The rich text content of the summary item. This should be a HTML-formatted string.")
});
var awardItemSchema = baseItemSchema.extend({
  title: z2.string().min(1).describe("The title of the award."),
  awarder: z2.string().describe("The awarder of the award."),
  date: z2.string().describe("The date when the award was received."),
  website: itemWebsiteSchema.describe("The website of the award, if any."),
  description: z2.string().describe("The description of the award. This should be a HTML-formatted string.")
});
var certificationItemSchema = baseItemSchema.extend({
  title: z2.string().min(1).describe("The title of the certification."),
  issuer: z2.string().describe("The issuer of the certification."),
  date: z2.string().describe("The date when the certification was received."),
  website: itemWebsiteSchema.describe("The website of the certification, if any."),
  description: z2.string().describe("The description of the certification. This should be a HTML-formatted string.")
});
var educationItemSchema = baseItemSchema.extend({
  school: z2.string().min(1).describe("The name of the school or institution."),
  degree: z2.string().describe("The degree or qualification obtained."),
  area: z2.string().describe("The area of study or specialization."),
  grade: z2.string().describe("The grade or score achieved."),
  location: z2.string().describe("The location of the school or institution."),
  period: z2.string().describe("The period of time the education was obtained over."),
  website: itemWebsiteSchema.describe("The website of the school or institution, if any."),
  description: z2.string().describe("The description of the education. This should be a HTML-formatted string.")
});
var roleItemSchema = z2.object({
  id: z2.string().describe("The unique identifier for the role. Usually generated as a UUID."),
  position: z2.string().describe("The position or job title for this role."),
  period: z2.string().describe("The period of time this role was held."),
  description: z2.string().describe("The description of this specific role. This should be a HTML-formatted string.")
});
var experienceItemSchema = baseItemSchema.extend({
  company: z2.string().min(1).describe("The name of the company or organization."),
  position: z2.string().describe(
    "The position held at the company or organization. Used when there is only a single role. If multiple roles are provided in the 'roles' field, this serves as a summary title or can be left blank."
  ),
  location: z2.string().describe("The location of the company or organization."),
  period: z2.string().describe(
    "The overall period of time at the company. When multiple roles are used, this should reflect the total tenure."
  ),
  website: itemWebsiteSchema.describe("The website of the company or organization, if any."),
  description: z2.string().describe("The description of the experience. This should be a HTML-formatted string."),
  roles: z2.array(roleItemSchema).catch([]).describe("List of individual roles held at this company to show career progression.")
});
var interestItemSchema = baseItemSchema.extend({
  icon: iconSchema,
  iconColor: iconColorSchema,
  name: z2.string().min(1).describe("The name of the interest/hobby."),
  keywords: z2.array(z2.string()).catch([]).describe("The keywords associated with the interest/hobby, if any. These are displayed as tags below the name.")
});
var languageItemSchema = baseItemSchema.extend({
  language: z2.string().min(1).describe("The name of the language the author knows."),
  fluency: z2.string().describe(
    "The fluency level of the language. Can be any text, such as 'Native', 'Fluent', 'Conversational', etc. or can also be a CEFR level (A1, A2, B1, B2, C1, C2)."
  ),
  level: z2.number().min(0).max(5).catch(0).describe(
    "The proficiency level of the language, defined as a number between 0 and 5. If set to 0, the icons displaying the level will be hidden."
  )
});
var profileItemSchema = baseItemSchema.extend({
  icon: iconSchema,
  iconColor: iconColorSchema,
  network: z2.string().min(1).describe("The name of the network or platform."),
  username: z2.string().describe("The username of the author on the network or platform."),
  website: itemWebsiteSchema.describe("The link to the profile of the author on the network or platform, if any.")
});
var projectItemSchema = baseItemSchema.extend({
  name: z2.string().min(1).describe("The name of the project."),
  period: z2.string().describe("The period of time the project was worked on."),
  website: itemWebsiteSchema.describe("The link to the project, if any."),
  description: z2.string().describe("The description of the project. This should be a HTML-formatted string.")
});
var publicationItemSchema = baseItemSchema.extend({
  title: z2.string().min(1).describe("The title of the publication."),
  publisher: z2.string().describe("The publisher of the publication."),
  date: z2.string().describe("The date when the publication was published."),
  website: itemWebsiteSchema.describe("The link to the publication, if any."),
  description: z2.string().describe("The description of the publication. This should be a HTML-formatted string.")
});
var referenceItemSchema = baseItemSchema.extend({
  name: z2.string().min(1).describe("The name of the reference, or a note such as 'Available upon request'."),
  position: z2.string().describe("The position or job title of the reference."),
  website: itemWebsiteSchema.describe("The website or LinkedIn profile of the reference, if any."),
  phone: z2.string().describe("The phone number of the reference."),
  description: z2.string().describe(
    "The description of the reference. Can be used to display a quote, a testimonial, etc. This should be a HTML-formatted string."
  )
});
var skillItemSchema = baseItemSchema.extend({
  icon: iconSchema,
  iconColor: iconColorSchema,
  name: z2.string().min(1).describe("The name of the skill."),
  proficiency: z2.string().describe(
    "The proficiency level of the skill. Can be any text, such as 'Beginner', 'Intermediate', 'Advanced', etc."
  ),
  level: z2.number().min(0).max(5).catch(0).describe(
    "The proficiency level of the skill, defined as a number between 0 and 5. If set to 0, the icons displaying the level will be hidden."
  ),
  keywords: z2.array(z2.string()).catch([]).describe("The keywords associated with the skill, if any. These are displayed as tags below the name.")
});
var volunteerItemSchema = baseItemSchema.extend({
  organization: z2.string().min(1).describe("The name of the organization or company."),
  location: z2.string().describe("The location of the organization or company."),
  period: z2.string().describe("The period of time the author was volunteered at the organization or company."),
  website: itemWebsiteSchema.describe("The link to the organization or company, if any."),
  description: z2.string().describe("The description of the volunteer experience. This should be a HTML-formatted string.")
});
var coverLetterItemSchema = baseItemSchema.extend({
  recipient: z2.string().describe("The recipient's address block as HTML (name, title, company, address, email)."),
  content: z2.string().describe("The cover letter body as HTML (salutation, paragraphs, closing, signature).")
});
var baseSectionSchema = z2.object({
  title: z2.string().describe("The title of the section."),
  columns: z2.number().int().min(1).max(6).catch(1).describe("The number of columns the section should span across."),
  hidden: z2.boolean().describe("Whether to hide the section from the resume.")
});
var awardsSectionSchema = baseSectionSchema.extend({
  items: z2.array(awardItemSchema).describe("The items to display in the awards section.")
});
var certificationsSectionSchema = baseSectionSchema.extend({
  items: z2.array(certificationItemSchema).describe("The items to display in the certifications section.")
});
var educationSectionSchema = baseSectionSchema.extend({
  items: z2.array(educationItemSchema).describe("The items to display in the education section.")
});
var experienceSectionSchema = baseSectionSchema.extend({
  items: z2.array(experienceItemSchema).describe("The items to display in the experience section.")
});
var interestsSectionSchema = baseSectionSchema.extend({
  items: z2.array(interestItemSchema).describe("The items to display in the interests section.")
});
var languagesSectionSchema = baseSectionSchema.extend({
  items: z2.array(languageItemSchema).describe("The items to display in the languages section.")
});
var profilesSectionSchema = baseSectionSchema.extend({
  items: z2.array(profileItemSchema).describe("The items to display in the profiles section.")
});
var projectsSectionSchema = baseSectionSchema.extend({
  items: z2.array(projectItemSchema).describe("The items to display in the projects section.")
});
var publicationsSectionSchema = baseSectionSchema.extend({
  items: z2.array(publicationItemSchema).describe("The items to display in the publications section.")
});
var referencesSectionSchema = baseSectionSchema.extend({
  items: z2.array(referenceItemSchema).describe("The items to display in the references section.")
});
var skillsSectionSchema = baseSectionSchema.extend({
  items: z2.array(skillItemSchema).describe("The items to display in the skills section.")
});
var volunteerSectionSchema = baseSectionSchema.extend({
  items: z2.array(volunteerItemSchema).describe("The items to display in the volunteer section.")
});
var sectionsSchema = z2.object({
  profiles: profilesSectionSchema.describe("The section to display the profiles of the author."),
  experience: experienceSectionSchema.describe("The section to display the experience of the author."),
  education: educationSectionSchema.describe("The section to display the education of the author."),
  projects: projectsSectionSchema.describe("The section to display the projects of the author."),
  skills: skillsSectionSchema.describe("The section to display the skills of the author."),
  languages: languagesSectionSchema.describe("The section to display the languages of the author."),
  interests: interestsSectionSchema.describe("The section to display the interests of the author."),
  awards: awardsSectionSchema.describe("The section to display the awards of the author."),
  certifications: certificationsSectionSchema.describe("The section to display the certifications of the author."),
  publications: publicationsSectionSchema.describe("The section to display the publications of the author."),
  volunteer: volunteerSectionSchema.describe("The section to display the volunteer experience of the author."),
  references: referencesSectionSchema.describe("The section to display the references of the author.")
});
var sectionTypeSchema = z2.enum([
  "summary",
  "profiles",
  "experience",
  "education",
  "projects",
  "skills",
  "languages",
  "interests",
  "awards",
  "certifications",
  "publications",
  "volunteer",
  "references",
  "cover-letter"
]);
var customSectionItemSchema = z2.union([
  // coverLetterItemSchema must come before summaryItemSchema because both have 'content',
  // but coverLetterItemSchema also requires 'recipient'. If summaryItemSchema is first,
  // cover letter items will match it and lose the 'recipient' field.
  coverLetterItemSchema,
  summaryItemSchema,
  profileItemSchema,
  experienceItemSchema,
  educationItemSchema,
  projectItemSchema,
  skillItemSchema,
  languageItemSchema,
  interestItemSchema,
  awardItemSchema,
  certificationItemSchema,
  publicationItemSchema,
  volunteerItemSchema,
  referenceItemSchema
]);
var customSectionSchema = baseSectionSchema.extend({
  id: z2.string().describe("The unique identifier for the custom section. Usually generated as a UUID."),
  type: sectionTypeSchema.describe(
    "The type of items this custom section contains. Determines which item schema and form fields to use."
  ),
  items: z2.array(customSectionItemSchema).describe("The items to display in the custom section. Items follow the schema of the section type.")
});
var customSectionsSchema = z2.array(customSectionSchema);
var fontWeightSchema = z2.enum(["100", "200", "300", "400", "500", "600", "700", "800", "900"]);
var typographyItemSchema = z2.object({
  fontFamily: z2.string().describe("The family of the font to use. Must be a supported resume font."),
  fontWeights: z2.array(fontWeightSchema).catch(["400"]).describe(
    "The weight of the font, defined as a number between 100 and 900. Default to 400 when unsure if the weight is available in the font."
  ),
  fontSize: z2.number().min(6).max(24).catch(11).describe("The size of the font to use, defined in points (pt)."),
  lineHeight: z2.number().min(0.5).max(4).catch(1.5).describe("The line height of the font to use, defined as a multiplier of the font size (e.g. 1.5 for 1.5x).")
});
var pageLayoutSchema = z2.object({
  fullWidth: z2.boolean().describe(
    "Whether the layout of the page should be full width. If true, the main column will span the entire width of the page. This means that there should be no items in the sidebar column."
  ),
  main: z2.array(z2.string()).describe(
    "The items to display in the main column of the page. A string array of section IDs (experience, education, projects, skills, languages, interests, awards, certifications, publications, volunteer, references, profiles, summary or UUIDs for custom sections)."
  ),
  sidebar: z2.array(z2.string()).describe(
    "The items to display in the sidebar column of the page. A string array of section IDs (experience, education, projects, skills, languages, interests, awards, certifications, publications, volunteer, references, profiles, summary or UUIDs for custom sections)."
  )
});
var layoutSchema = z2.object({
  sidebarWidth: z2.number().min(10).max(50).catch(35).describe("The width of the sidebar column, defined as a percentage of the page width."),
  pages: z2.array(pageLayoutSchema).describe("The pages to display in the layout.")
});
var pageSchema = z2.object({
  gapX: z2.number().min(0).describe("The horizontal gap between the sections of the page, defined in points (pt)."),
  gapY: z2.number().min(0).describe("The vertical gap between the sections of the page, defined in points (pt)."),
  marginX: z2.number().min(0).describe("The horizontal margin of the page, defined in points (pt)."),
  marginY: z2.number().min(0).describe("The vertical margin of the page, defined in points (pt)."),
  format: z2.enum(["a4", "letter", "free-form"]).describe("The format of the page. Can be 'a4', 'letter', or 'free-form'.").catch("a4"),
  locale: z2.string().describe("The locale of the page. Used for displaying pre-translated section headings, if not overridden.").catch("en-US"),
  hideIcons: z2.boolean().describe("Whether to hide the icons of the sections.").catch(false)
});
var levelDesignSchema = z2.object({
  icon: iconSchema,
  type: z2.enum(["hidden", "circle", "square", "rectangle", "rectangle-full", "progress-bar", "icon"]).describe(
    "The type of the level design. 'hidden' will hide the level design, 'circle' will display a circle, 'square' will display a square, 'rectangle' will display a rectangle, 'rectangle-full' will display a full rectangle, 'progress-bar' will display a progress bar, and 'icon' will display an icon. If 'icon' is selected, the icon to display should be specified in the 'icon' field."
  )
});
var colorDesignSchema = z2.object({
  primary: z2.string().describe("The primary color of the design, defined as rgba(r, g, b, a)."),
  text: z2.string().describe("The text color of the design, defined as rgba(r, g, b, a). Usually set to black: rgba(0, 0, 0, 1)."),
  background: z2.string().describe(
    "The background color of the design, defined as rgba(r, g, b, a). Usually set to white: rgba(255, 255, 255, 1)."
  )
});
var designSchema = z2.object({
  level: levelDesignSchema,
  colors: colorDesignSchema
});
var typographySchema = z2.object({
  body: typographyItemSchema.describe("The typography for the body of the resume."),
  heading: typographyItemSchema.describe("The typography for the headings of the resume.")
});
var metadataSchema = z2.object({
  template: templateSchema.catch("onyx").describe("The template to use for the resume. Determines the overall design and appearance of the resume."),
  layout: layoutSchema.describe(
    "The layout of the resume. Determines the structure and arrangement of the sections on the resume."
  ),
  page: pageSchema.describe(
    "The page settings of the resume. Determines the margins, format, and locale of the resume."
  ),
  design: designSchema.describe(
    "The design settings of the resume. Determines the colors, level designs, and typography of the resume."
  ),
  typography: typographySchema.describe(
    "The typography settings of the resume. Determines the fonts and sizes of the body and headings of the resume."
  ),
  notes: z2.string().describe(
    "Personal notes for the resume. Can be used to add any additional information or instructions for the resume. These notes are not displayed on the resume, they are only visible to the author of the resume when editing the resume. This should be a HTML-formatted string."
  )
});
var resumeDataSchema = z2.looseObject({
  picture: pictureSchema.describe("Configuration for photograph displayed on the resume"),
  basics: basicsSchema.describe(
    "Basic information about the author, such as name, email, phone, location, and website"
  ),
  summary: summarySchema.describe("Summary section of the resume, useful for a short bio or introduction"),
  sections: sectionsSchema.describe("Various sections of the resume, such as experience, education, projects, etc."),
  customSections: customSectionsSchema.describe(
    "Custom sections of the resume, such as a custom section for notes, etc."
  ),
  metadata: metadataSchema.describe(
    "Metadata for the resume, such as template, layout, typography, etc. This section describes the overall design and appearance of the resume."
  )
});

// src/validate.ts
function dotPath(path) {
  return path.join(".");
}
function mapIssue(issue) {
  const path = dotPath(issue.path);
  const code = issue.code;
  const rawExpected = "expected" in issue && issue.expected !== void 0 ? String(issue.expected) : void 0;
  const receivedMatch = issue.message.match(/received (.+)$/);
  let received;
  if ("received" in issue && issue.received !== void 0) {
    received = String(issue.received);
  } else if (receivedMatch) {
    received = receivedMatch[1];
  }
  let message;
  if (code === "invalid_type" && rawExpected) {
    if (!received || received === "undefined") {
      message = `expected ${rawExpected}, but field is missing`;
      received = void 0;
    } else {
      message = `expected ${rawExpected}, received ${received}`;
    }
  } else {
    message = issue.message;
  }
  const error = { path, message, code };
  if (rawExpected) error.expected = rawExpected;
  if (received) error.received = received;
  return error;
}
function validate(input) {
  const result = resumeDataSchema.safeParse(input);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  return {
    ok: false,
    errors: result.error.issues.map(mapIssue)
  };
}

export {
  resumeDataSchema,
  validate
};
