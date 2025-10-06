"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../../../src/config/supabase");
describe('Supabase Configuration', () => {
    it('should create supabase client instance', () => {
        expect(supabase_1.supabase).toBeDefined();
        expect(supabase_1.supabase.auth).toBeDefined();
    });
    it('should create supabaseAdmin client instance', () => {
        expect(supabase_1.supabaseAdmin).toBeDefined();
        expect(supabase_1.supabaseAdmin.auth).toBeDefined();
    });
    it('should have different clients for public and admin', () => {
        expect(supabase_1.supabase).not.toBe(supabase_1.supabaseAdmin);
    });
});
//# sourceMappingURL=supabase.test.js.map