<tr>
<td style="background-color: #0f1729; padding: 8px 0 36px;">
<table class="footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td class="content-cell" align="center" style="padding: 24px 40px;">
    <div style="height: 1px; background-color: #1a253c; margin-bottom: 24px;"></div>
    <p style="color: #2c3e63; font-size: 12px; text-align: center; margin: 0 0 6px;">
        {{ Illuminate\Mail\Markdown::parse($slot) }}
    </p>
    <p style="color: #1e2d47; font-size: 11px; text-align: center; margin: 0; letter-spacing: 0.05em; text-transform: uppercase;">
        &copy; {{ date('Y') }} WorkSync &mdash; Plateforme RH Nouvelle G&eacute;n&eacute;ration
    </p>
</td>
</tr>
</table>
</td>
</tr>
