import { pgTable, text, uuid, integer, boolean, timestamp } from "drizzle-orm/pg-core"

import { relations } from "drizzle-orm"


export const files = pgTable("files", {
    id: uuid("id").defaultRandom().primaryKey(),

    // basic files and folder information
    name: text("name").notNull(),
    path: text("path").notNull(),
    size: integer('size').notNull(),
    type: text("type").notNull(), // folder



    // storage information

    fileUrl: text("file_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),

    // ownership

    userId: text('user_id').notNull(),
    parentId: uuid("parent_id"),

    // file/folder flags

    isFolder: boolean("is_folder").default(false).notNull(),
    isStarred: boolean("is_starred").default(false).notNull(),
    isTrash: boolean("is_trash").default(false).notNull(),

    // TimeStamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

})

export const filesRelations = relations(files, ({ one, many }) => (
    {
        parent: one(files, {
            fields: [files.parentId],
            references: [files.id]
        }),

        children: many(files)

    }
))


// types defination

export const File = typeof files.$inferSelect
export const newFile = typeof files.$inferInsert 